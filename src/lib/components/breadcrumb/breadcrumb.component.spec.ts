import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbConfig, BreadcrumbConfigParameters, BreadcrumbItem } from './models/breadcrumb.model';

class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

describe('BreadcrumbComponent', () => {
    let fixture: ComponentFixture<BreadcrumbComponent>;

    function buildConfig(overrides: Partial<BreadcrumbConfigParameters> = {}): BreadcrumbConfig {
        return new BreadcrumbConfig({
            translate: false,
            items: [
                new BreadcrumbItem({ id: 1, label: 'Home' }),
                new BreadcrumbItem({ id: 2, label: 'Templates' }),
                new BreadcrumbItem({ id: 3, label: 'Editor' })
            ],
            ...overrides
        });
    }

    async function render(config: BreadcrumbConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(BreadcrumbComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function items(): HTMLElement[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('li:not([aria-hidden])')];
    }

    function labels(): string[] {
        return items().map(item => item.textContent?.trim() ?? '');
    }

    function link(name: string): HTMLButtonElement | undefined {
        return [...fixture.nativeElement.querySelectorAll<HTMLButtonElement>('button')].find(
            button => button.textContent?.trim() === name
        );
    }

    beforeEach(async () => {
        global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [BreadcrumbComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders one entry per item in the config', async () => {
        await render();

        expect(labels()).toEqual(['Home', 'Templates', 'Editor']);
    });

    it('renders every item but the last as a link', async () => {
        await render();

        expect(link('Home')).toBeDefined();
        expect(link('Templates')).toBeDefined();
        expect(link('Editor')).toBeUndefined();
    });

    it('marks the last item as the current page', async () => {
        await render();

        const current = items().filter(item => item.getAttribute('aria-current') === 'page');

        expect(current.map(item => item.textContent?.trim())).toEqual(['Editor']);
    });

    it('reports the id of a clicked item', async () => {
        const onItemClick = jest.fn();
        await render(buildConfig({ onItemClick }));

        link('Templates')?.click();

        expect(onItemClick).toHaveBeenCalledWith(2);
    });

    it('ignores a click on a disabled item', async () => {
        const onItemClick = jest.fn();
        await render(
            buildConfig({
                onItemClick,
                items: [
                    new BreadcrumbItem({ id: 1, label: 'Home', isDisabled: true }),
                    new BreadcrumbItem({ id: 2, label: 'Editor' })
                ]
            })
        );

        link('Home')?.click();

        expect(onItemClick).not.toHaveBeenCalled();
    });

    it('separates the items with the configured separator', async () => {
        await render(buildConfig({ separator: '>' }));

        const separators = [...fixture.nativeElement.querySelectorAll('li[aria-hidden="true"]')];

        expect(separators.map(element => element.textContent?.trim())).toEqual(['>', '>']);
    });

    it('resolves labels against the prefix when translation is on', async () => {
        TestBed.inject(TranslateService).setTranslation('en', { nav: { home: 'Inicio' } });
        TestBed.inject(TranslateService).use('en');

        await render(
            buildConfig({ translate: true, prefix: 'nav', items: [new BreadcrumbItem({ id: 1, label: 'home' })] })
        );

        expect(labels()).toEqual(['Inicio']);
    });

    it('takes a label that is already a key without the prefix', async () => {
        TestBed.inject(TranslateService).setTranslation('en', { 'shared.back': 'Back' });
        TestBed.inject(TranslateService).use('en');

        await render(
            buildConfig({
                translate: true,
                prefix: 'nav',
                items: [new BreadcrumbItem({ id: 1, label: 'shared.back', isTranslationKey: true })]
            })
        );

        expect(labels()).toEqual(['Back']);
    });

    it('follows a language change', async () => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', { nav: { home: 'Home' } });
        translate.setTranslation('es', { nav: { home: 'Inicio' } });
        translate.use('en');

        await render(
            buildConfig({ translate: true, prefix: 'nav', items: [new BreadcrumbItem({ id: 1, label: 'home' })] })
        );

        expect(labels()).toEqual(['Home']);

        translate.use('es');
        fixture.detectChanges();

        expect(labels()).toEqual(['Inicio']);
    });

    it('names the navigation for assistive technology', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe(
            'angular-components.breadcrumb.label'
        );
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ items: [new BreadcrumbItem({ id: 9, label: 'Only' })] }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(labels()).toEqual(['Only']);
    });
});
