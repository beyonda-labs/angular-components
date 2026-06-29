import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbConfig, BreadcrumbItem } from './models/breadcrumb.model';

class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

describe('BreadcrumbComponent', () => {
    let component: BreadcrumbComponent;
    let fixture: ComponentFixture<BreadcrumbComponent>;

    beforeEach(async () => {
        global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [BreadcrumbComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(BreadcrumbComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should render all items', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        expect(items.length).toBe(3);
    });

    it('should mark the last item with aria-current page', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        const lastItem = items[items.length - 1];
        expect(lastItem.getAttribute('aria-current')).toBe('page');
    });

    it('should not set aria-current on non-last items', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        expect(items[0].getAttribute('aria-current')).toBeNull();
        expect(items[1].getAttribute('aria-current')).toBeNull();
    });

    it('should render the last item without a button', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        const lastItem = items[items.length - 1];
        expect(lastItem.querySelector('button')).toBeNull();
    });

    it('should render non-last items with a button', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        expect(items[0].querySelector('button')).toBeTruthy();
        expect(items[1].querySelector('button')).toBeTruthy();
    });

    it('should call onItemClick when clicking a non-last item', () => {
        const onItemClick = jest.fn();
        component.config = buildConfig({ onItemClick });
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('.bey-breadcrumb-item-button');
        button.click();

        expect(onItemClick).toHaveBeenCalledWith(1);
    });

    it('should not call onItemClick when clicking a disabled item', () => {
        const onItemClick = jest.fn();
        component.config = buildConfig({
            items: [
                new BreadcrumbItem({ id: 1, label: 'Home', isDisabled: true }),
                new BreadcrumbItem({ id: 2, label: 'Products' }),
                new BreadcrumbItem({ id: 3, label: 'Detail' })
            ],
            onItemClick
        });
        fixture.detectChanges();

        component.onItemClick(component.config.items[0]);
        expect(onItemClick).not.toHaveBeenCalled();
    });

    it('should not call onItemClick for the last item', () => {
        const onItemClick = jest.fn();
        component.config = buildConfig({ onItemClick });
        fixture.detectChanges();

        const lastItem = component.config.items[component.config.items.length - 1];
        component.onItemClick(lastItem);
        expect(onItemClick).not.toHaveBeenCalled();
    });

    it('should render separators between items but not after last', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const separators = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-separator');
        expect(separators.length).toBe(2);
    });

    it('should use custom separator text', () => {
        component.config = buildConfig({ separator: '>' });
        fixture.detectChanges();

        const separator = fixture.nativeElement.querySelector('.bey-breadcrumb-separator');
        expect(separator.textContent.trim()).toBe('>');
    });

    it('should resolve item labels with prefix', () => {
        const config = buildConfig();
        component.config = config;

        const label = component.getItemLabel(config.items[0]);
        expect(label).toBe('test.Home');
    });

    it('should use custom label when provided', () => {
        component.config = buildConfig({
            items: [
                new BreadcrumbItem({ id: 1, label: 'custom.home.label' }),
                new BreadcrumbItem({ id: 2, label: 'custom.detail.label' })
            ]
        });

        const label = component.getItemLabel(component.config.items[0]);
        expect(label).toBe('test.custom.home.label');
    });

    it('should add disabled attribute on disabled item buttons', () => {
        component.config = buildConfig({
            items: [
                new BreadcrumbItem({ id: 1, label: 'Home', isDisabled: true }),
                new BreadcrumbItem({ id: 2, label: 'Products' }),
                new BreadcrumbItem({ id: 3, label: 'Detail' })
            ]
        });
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item-button');
        expect(buttons[0].disabled).toBe(true);
        expect(buttons[1].disabled).toBe(false);
    });

    it('should add current class to the last item', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item');
        const lastItem = items[items.length - 1];
        expect(lastItem.classList.contains('bey-breadcrumb-item-current')).toBe(true);
    });

    it('should have a nav element with aria-label', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const nav = fixture.nativeElement.querySelector('nav');
        expect(nav).toBeTruthy();
        expect(nav.getAttribute('aria-label')).toBeTruthy();
    });

    it('should identify last item correctly via isLast', () => {
        component.config = buildConfig();

        const { items } = component.config;
        expect(component.isLast(items[0])).toBe(false);
        expect(component.isLast(items[1])).toBe(false);
        expect(component.isLast(items[2])).toBe(true);
    });

    it('should set itemMaxWidth as CSS custom property', () => {
        component.config = buildConfig({ itemMaxWidth: '8rem' });
        fixture.detectChanges();

        const ol = fixture.nativeElement.querySelector('.bey-breadcrumb');
        expect(ol.style.getPropertyValue('--bey-breadcrumb-item-max-width')).toBe('8rem');
    });

    it('should show all items when container is wide enough', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component.visibleStartIndex).toBe(0);
        expect(component.hasCollapsedItems).toBe(false);
        expect(component.visibleItems.length).toBe(3);
    });

    it('should return raw label when no prefix is set', () => {
        component.config = buildConfig({
            prefix: '',
            items: [new BreadcrumbItem({ id: 1, label: 'Home' }), new BreadcrumbItem({ id: 2, label: 'Detail' })]
        });

        const label = component.getItemLabel(component.config.items[0]);
        expect(label).toBe('Home');
    });

    it('should render raw labels when translate is false', () => {
        component.config = buildConfig({
            translate: false,
            items: [new BreadcrumbItem({ id: 1, label: 'Home' }), new BreadcrumbItem({ id: 2, label: 'Detail' })]
        });
        fixture.detectChanges();

        const labels = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item-label');
        expect(labels[0].textContent.trim()).toBe('Home');
        expect(labels[1].textContent.trim()).toBe('Detail');
    });

    it('should resolve label with translation when translate is true', () => {
        component.config = buildConfig();

        const label = component.resolveLabel(component.config.items[0]);
        expect(label).toBe('test.Home');
    });

    it('should resolve label without translation when translate is false', () => {
        component.config = buildConfig({
            translate: false,
            items: [new BreadcrumbItem({ id: 1, label: 'Home' }), new BreadcrumbItem({ id: 2, label: 'Detail' })]
        });

        const label = component.resolveLabel(component.config.items[0]);
        expect(label).toBe('Home');
    });
});

function buildConfig(
    overrides?: Partial<BreadcrumbConfig> & {
        items?: BreadcrumbItem[];
        onItemClick?: (id: number) => void;
    }
): BreadcrumbConfig {
    return new BreadcrumbConfig({
        itemMaxWidth: overrides?.itemMaxWidth,
        onItemClick: overrides?.onItemClick,
        prefix: overrides?.prefix ?? 'test',
        separator: overrides?.separator,
        translate: overrides?.translate,
        items: overrides?.items ?? [
            new BreadcrumbItem({ id: 1, label: 'Home' }),
            new BreadcrumbItem({ id: 2, label: 'Products' }),
            new BreadcrumbItem({ id: 3, label: 'Detail' })
        ]
    });
}
