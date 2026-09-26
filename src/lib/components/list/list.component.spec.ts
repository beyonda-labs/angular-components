import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, settle } from '@testing/dom';

import { ListComponent } from './list.component';
import { ListConfig, ListConfigParameters } from './models/list.model';

interface Employee {
    id: number;
    name: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ListComponent],
    standalone: true,
    template: `
        <bey-list [config]="config()">
            <ng-template let-employee let-index="index">
                <span class="card">{{ employee.name }} #{{ index }}</span>
                <input class="inside" />
            </ng-template>
        </bey-list>
    `
})
class HostComponent {
    readonly config = signal<ListConfig<Employee>>(new ListConfig<Employee>({ items: [], prefix: 'demo.list' }));
}

describe('ListComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    function buildConfig(overrides: Partial<ListConfigParameters<Employee>> = {}): ListConfig<Employee> {
        return new ListConfig<Employee>({
            prefix: 'demo.list',
            items: [
                { id: 1, name: 'Ada' },
                { id: 2, name: 'Grace' }
            ],
            ...overrides
        });
    }

    async function render(config: ListConfig<Employee> = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.config.set(config);
        await settle(fixture);
    }

    function items(): HTMLElement[] {
        return queryAll(fixture, '[role="list"] > [role="listitem"], [role="list"] > [role="button"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders the consumer template once per item, with its index', async () => {
        await render();

        expect(items().map(item => item.querySelector('.card')?.textContent)).toEqual(['Ada #0', 'Grace #1']);
    });

    it('shows the empty label when there are no items', async () => {
        TestBed.inject(TranslateService).setTranslation('en', { demo: { list: { empty: 'Nothing here' } } });
        TestBed.inject(TranslateService).use('en');

        await render(buildConfig({ items: [] }));

        expect(fixture.nativeElement.textContent.trim()).toBe('Nothing here');
        expect(items()).toHaveLength(0);
    });

    it('takes an empty label given instead of the one built from the prefix', async () => {
        await render(buildConfig({ items: [], emptyLabel: 'demo.custom' }));

        expect(fixture.nativeElement.textContent.trim()).toBe('demo.custom');
    });

    it('reports the item and its index when a card is clicked', async () => {
        const onItemClick = jest.fn();
        await render(buildConfig({ onItemClick }));

        items()[1].click();

        expect(onItemClick).toHaveBeenCalledWith({ id: 2, name: 'Grace' }, 1);
    });

    it('offers the cards to the keyboard only when they do something', async () => {
        await render();

        expect(items().every(item => item.getAttribute('role') === 'listitem')).toBe(true);

        await render(buildConfig({ onItemClick: jest.fn() }));

        expect(items().every(item => item.getAttribute('role') === 'button')).toBe(true);
        expect(items().every(item => item.getAttribute('tabindex') === '0')).toBe(true);
    });

    it('activates a card with the space key', async () => {
        const onItemClick = jest.fn();
        await render(buildConfig({ onItemClick }));

        items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

        expect(onItemClick).toHaveBeenCalledWith({ id: 1, name: 'Ada' }, 0);
    });

    it('leaves the space key alone when it is typed inside a control of the card', async () => {
        const onItemClick = jest.fn();
        await render(buildConfig({ onItemClick }));

        items()[0]
            .querySelector('input.inside')
            ?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

        expect(onItemClick).not.toHaveBeenCalled();
    });

    it('keeps an item across a reorder when the config says how to identify it', async () => {
        await render(buildConfig({ getItemKey: employee => employee.id }));

        const first = items()[0];

        fixture.componentInstance.config.set(
            buildConfig({
                getItemKey: employee => employee.id,
                items: [
                    { id: 2, name: 'Grace' },
                    { id: 1, name: 'Ada' }
                ]
            })
        );
        await settle(fixture);

        expect(items()[1]).toBe(first);
    });
});
