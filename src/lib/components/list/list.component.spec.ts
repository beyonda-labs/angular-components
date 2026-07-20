import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ListComponent } from './list.component';
import { ListConfig } from './models/list.model';

interface TestItem {
    id: number;
    name: string;
}

@Component({
    imports: [ListComponent],
    standalone: true,
    template: `
        <bey-list [config]="config">
            <ng-template let-item let-index="index">
                <div class="test-card">{{ index }} - {{ item.name }}</div>
            </ng-template>
        </bey-list>
    `
})
class ListHostComponent {
    @ViewChild(ListComponent) listComponent!: ListComponent;

    config!: ListConfig<TestItem>;
}

describe('ListComponent', () => {
    let hostFixture: ComponentFixture<ListHostComponent>;
    let host: ListHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListHostComponent, TranslateModule.forRoot()]
        }).compileComponents();

        hostFixture = TestBed.createComponent(ListHostComponent);
        host = hostFixture.componentInstance;
    });

    it('should create', () => {
        host.config = buildConfig();
        hostFixture.detectChanges();

        expect(host.listComponent).toBeTruthy();
    });

    it('should render one wrapper per item, projecting the consumer template', () => {
        host.config = buildConfig();
        hostFixture.detectChanges();

        const cards = hostFixture.nativeElement.querySelectorAll('.test-card');

        expect(cards).toHaveLength(2);
        expect(cards[0].textContent.trim()).toBe('0 - Ada');
        expect(cards[1].textContent.trim()).toBe('1 - Linus');
    });

    it('should render the empty state when there are no items', () => {
        host.config = buildConfig({ items: [] });
        hostFixture.detectChanges();

        const empty = hostFixture.nativeElement.querySelector('.bey-list-empty');

        expect(empty).toBeTruthy();
        expect(hostFixture.nativeElement.querySelectorAll('.bey-list-item')).toHaveLength(0);
    });

    it('should apply the bare modifier class when config.bare is true', () => {
        host.config = buildConfig({ bare: true });
        hostFixture.detectChanges();

        const item = hostFixture.nativeElement.querySelector('.bey-list-item');

        expect(item.classList.contains('bey-list-item-bare')).toBe(true);
    });

    it('should call onItemClick with the item and index when a card is clicked', () => {
        const onItemClick = jest.fn();

        host.config = buildConfig({ onItemClick });
        hostFixture.detectChanges();

        const items = hostFixture.nativeElement.querySelectorAll('.bey-list-item');

        (items[1] as HTMLElement).click();

        expect(onItemClick).toHaveBeenCalledWith({ id: 2, name: 'Linus' }, 1);
    });

    it('should not mark items as clickable without onItemClick', () => {
        host.config = buildConfig();
        hostFixture.detectChanges();

        const item = hostFixture.nativeElement.querySelector('.bey-list-item') as HTMLElement;

        expect(item.classList.contains('bey-list-item-clickable')).toBe(false);
        expect(item.getAttribute('role')).toBeNull();
    });

    it('should use getItemKey to track items when provided', () => {
        const getItemKey = jest.fn((item: TestItem) => item.id);

        host.config = buildConfig({ getItemKey });
        hostFixture.detectChanges();

        expect(host.listComponent.trackByItem(0, { id: 2, name: 'Linus' })).toBe(2);
        expect(getItemKey).toHaveBeenCalled();
    });

    it('should fall back to the index when getItemKey is not provided', () => {
        host.config = buildConfig();
        hostFixture.detectChanges();

        expect(host.listComponent.trackByItem(1, { id: 2, name: 'Linus' })).toBe(1);
    });

    it('should resolve the default empty label from the prefix', () => {
        host.config = buildConfig({ items: [] });
        hostFixture.detectChanges();

        expect(host.listComponent.getEmptyLabel()).toBe('test.list.empty');
    });

    it('should use the custom empty label when provided', () => {
        host.config = buildConfig({ emptyLabel: 'custom.empty', items: [] });
        hostFixture.detectChanges();

        expect(host.listComponent.getEmptyLabel()).toBe('custom.empty');
    });
});

function buildConfig(overrides?: Partial<ListConfig<TestItem>>): ListConfig<TestItem> {
    return new ListConfig<TestItem>({
        items: [
            { id: 1, name: 'Ada' },
            { id: 2, name: 'Linus' }
        ],
        prefix: 'test.list',
        ...overrides
    });
}
