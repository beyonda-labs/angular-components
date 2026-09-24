import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PaginationConfig, PaginationConfigParameters } from './models/pagination.model';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
    let fixture: ComponentFixture<PaginationComponent>;

    function buildConfig(overrides: Partial<PaginationConfigParameters> = {}): PaginationConfig {
        return new PaginationConfig({ page: 1, pageSize: 25, totalItems: 500, ...overrides });
    }

    async function render(config: PaginationConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(PaginationComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function button(testId: string): HTMLButtonElement {
        return fixture.nativeElement.querySelector(`[data-testid="${testId}-button"]`);
    }

    function pageInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector('[data-testid="page-input"]');
    }

    function currentPage(): string {
        return pageInput().value;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('starts on the page the config names', async () => {
        await render(buildConfig({ page: 3 }));

        expect(currentPage()).toBe('3');
    });

    it('derives the number of pages from the total and the page size', async () => {
        await render(buildConfig({ totalItems: 120, pageSize: 50 }));

        expect(pageInput().getAttribute('max')).toBe('3');
    });

    it('reports every page move', async () => {
        const onPageChange = jest.fn();
        await render(buildConfig({ onPageChange }));

        button('next-page').click();
        await settle();

        expect(currentPage()).toBe('2');
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('walks back and forth', async () => {
        await render(buildConfig({ page: 5 }));

        button('previous-page').click();
        await settle();

        expect(currentPage()).toBe('4');
    });

    it('jumps to the first and last page', async () => {
        await render(buildConfig({ page: 5, totalItems: 500, pageSize: 25 }));

        button('last-page').click();
        await settle();
        expect(currentPage()).toBe('20');

        button('first-page').click();
        await settle();
        expect(currentPage()).toBe('1');
    });

    it('stops at the ends', async () => {
        const onPageChange = jest.fn();
        await render(buildConfig({ page: 1, totalItems: 10, pageSize: 25, onPageChange }));

        expect(button('previous-page').disabled).toBe(true);
        expect(button('next-page').disabled).toBe(true);

        button('next-page').click();
        await settle();

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it('hides the first and last buttons when there are few pages', async () => {
        await render(buildConfig({ totalItems: 50, pageSize: 25 }));

        expect(button('first-page')).toBeNull();
        expect(button('last-page')).toBeNull();
    });

    it('reports a page size change and brings the page back in range', async () => {
        const onPageSizeChange = jest.fn();
        await render(buildConfig({ page: 20, totalItems: 500, pageSize: 25, onPageSizeChange }));

        const select: HTMLSelectElement = fixture.nativeElement.querySelector('[data-testid="page-size-select"]');
        select.value = select.options[2].value;
        select.dispatchEvent(new Event('change'));
        await settle();

        expect(onPageSizeChange).toHaveBeenCalledWith(100);
        expect(currentPage()).toBe('5');
    });

    it('clamps a page typed beyond the last one', async () => {
        await render(buildConfig({ totalItems: 100, pageSize: 25 }));

        pageInput().value = '99';
        pageInput().dispatchEvent(new Event('input'));
        await settle();

        expect(currentPage()).toBe('4');
    });

    it('stays on the same page when the input is cleared', async () => {
        const onPageChange = jest.fn();
        await render(buildConfig({ page: 2, onPageChange }));

        pageInput().value = '';
        pageInput().dispatchEvent(new Event('input'));
        pageInput().dispatchEvent(new Event('blur'));
        await settle();

        expect(onPageChange).not.toHaveBeenCalled();
        expect(button('next-page').disabled).toBe(false);
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ page: 7 }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(currentPage()).toBe('7');
    });
});
