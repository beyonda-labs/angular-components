import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PaginationConfig, type PaginationConfigParameters } from './models/pagination.model';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should hide first and last buttons when there are fewer than six pages', () => {
        component.config = buildConfig({ pageSize: 25, totalItems: 95 });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[data-testid="first-page-button"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('[data-testid="last-page-button"]')).toBeNull();
    });

    it('should show first and last buttons when there are at least six pages', () => {
        component.config = buildConfig({ pageSize: 25, totalItems: 150 });
        fixture.detectChanges();

        expect(component.totalPages).toBe(6);
        expect(fixture.nativeElement.querySelector('[data-testid="first-page-button"]')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('[data-testid="last-page-button"]')).toBeTruthy();
    });

    it('should disable previous navigation when current page is the first page', () => {
        component.config = buildConfig({ page: 1, totalItems: 150 });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[data-testid="first-page-button"]').disabled).toBe(true);
        expect(fixture.nativeElement.querySelector('[data-testid="previous-page-button"]').disabled).toBe(true);
    });

    it('should clamp page input inside the valid range', () => {
        component.config = buildConfig({ page: 1, pageSize: 25, totalItems: 240 });
        fixture.detectChanges();

        component.onPageInputChange('999');

        expect(component.config.page).toBe(10);
        expect(component.pageInputValue).toBe('10');
    });

    it('should update page size and clamp current page when needed', () => {
        const onPageSizeChange = jest.fn();

        component.config = buildConfig({ onPageSizeChange, page: 4, pageSize: 25, totalItems: 95 });
        fixture.detectChanges();
        component.onPageSizeChange(50);

        expect(component.config.pageSize).toBe(50);
        expect(component.config.totalPages).toBe(2);
        expect(component.config.page).toBe(2);
        expect(onPageSizeChange).toHaveBeenCalled();
    });

    it('should expose the visible result range for the tooltip', () => {
        component.config = buildConfig({ page: 2, pageSize: 25, totalItems: 95 });

        expect(component.getResultsTooltipParams()).toEqual({ end: 50, start: 26, total: 95 });
    });
});

function buildConfig(parameters?: PaginationConfigParameters): PaginationConfig {
    return new PaginationConfig({
        onPageChange: parameters?.onPageChange,
        onPageSizeChange: parameters?.onPageSizeChange,
        page: parameters?.page ?? 1,
        pageSize: parameters?.pageSize ?? 25,
        totalItems: parameters?.totalItems ?? 95
    });
}
