import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SearchConfig, SearchField, SearchFieldType } from './models/search.model';
import { BooleanFilter, NumberFilter, SearchFilterOperator, StringFilter } from './models/search-filter.model';
import { SearchComponent } from './search.component';

const onFiltersChange = jest.fn();

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async () => {
        onFiltersChange.mockReset();

        await TestBed.configureTestingModule({
            imports: [SearchComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        component.config = buildConfig();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the main search input when a main field is configured', () => {
        expect(fixture.nativeElement.querySelector('.bey-search-box-input')).toBeTruthy();
    });

    it('should hide the main search input without a main field', () => {
        component.config = buildConfig({ mainField: undefined });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-search-box-input')).toBeNull();
        expect(fixture.nativeElement.querySelector('.bey-search-toggle')).toBeTruthy();
    });

    it('should emit a contains filter on the main field after the debounce', fakeAsync(() => {
        component.onSearchTermChange(buildSelectEvent('oat'));

        expect(onFiltersChange).not.toHaveBeenCalled();

        tick(300);

        expect(onFiltersChange).toHaveBeenCalledWith([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'oat' })
        ]);
    }));

    it('should show the main search as a panel row with an editable operator', fakeAsync(() => {
        component.onSearchTermChange(buildSelectEvent('oat'));
        tick(300);

        expect(component.rows).toEqual([
            { fieldKey: 'name', operator: SearchFilterOperator.Contains, value: 'oat', valueTo: '' }
        ]);

        component.onOperatorChange(0, buildSelectEvent(SearchFilterOperator.StartsWith));
        component.applyFilters();

        expect(onFiltersChange).toHaveBeenLastCalledWith([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.StartsWith, value: 'oat' })
        ]);
        expect(component.searchTerm).toBe('oat');
    }));

    it('should keep the customized operator of the main row while typing', fakeAsync(() => {
        component.onSearchTermChange(buildSelectEvent('oat'));
        tick(300);

        component.onOperatorChange(0, buildSelectEvent(SearchFilterOperator.StartsWith));
        component.applyFilters();

        component.onSearchTermChange(buildSelectEvent('oats'));
        tick(300);

        expect(onFiltersChange).toHaveBeenLastCalledWith([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.StartsWith, value: 'oats' })
        ]);
    }));

    it('should clear the search input when the main row is removed and applied', fakeAsync(() => {
        component.onSearchTermChange(buildSelectEvent('oat'));
        tick(300);

        component.removeRow(0);
        component.applyFilters();

        expect(component.searchTerm).toBe('');
        expect(onFiltersChange).toHaveBeenLastCalledWith([]);
    }));

    it('should remove the main row when the search input is emptied', fakeAsync(() => {
        component.onSearchTermChange(buildSelectEvent('oat'));
        tick(300);

        component.onSearchTermChange(buildSelectEvent(''));
        tick(300);

        expect(component.rows).toHaveLength(0);
        expect(onFiltersChange).toHaveBeenLastCalledWith([]);
    }));

    it('should apply a valid text filter row', () => {
        component.addRow();
        setRow(0, 'name', SearchFilterOperator.StartsWith, 'Coffee');

        component.applyFilters();

        expect(component.appliedFilters).toEqual([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.StartsWith, value: 'Coffee' })
        ]);
        expect(onFiltersChange).toHaveBeenCalledWith(component.appliedFilters);
        expect(component.panelOpen).toBe(false);
    });

    it('should apply a between filter with both bounds', () => {
        component.addRow();
        setRow(0, 'price', SearchFilterOperator.Between, '10', '20');

        component.applyFilters();

        expect(component.appliedFilters).toEqual([
            new NumberFilter({ field: 'price', operator: SearchFilterOperator.Between, value: [10, 20] })
        ]);
    });

    it('should apply a boolean filter from the true/false select', () => {
        component.addRow();
        setRow(0, 'available', SearchFilterOperator.Equals, 'true');

        component.applyFilters();

        expect(component.appliedFilters).toEqual([
            new BooleanFilter({ field: 'available', operator: SearchFilterOperator.Equals, value: true })
        ]);
    });

    it('should skip incomplete rows when applying', () => {
        component.addRow();
        component.addRow();
        setRow(0, 'name', SearchFilterOperator.Contains, 'tea');

        component.applyFilters();

        expect(component.appliedFilters).toHaveLength(1);
    });

    it('should combine the main search filter with the applied filters', fakeAsync(() => {
        component.addRow();
        setRow(0, 'available', SearchFilterOperator.Equals, 'true');
        component.applyFilters();
        onFiltersChange.mockClear();

        component.onSearchTermChange(buildSelectEvent('oat'));
        tick(300);

        expect(onFiltersChange).toHaveBeenCalledWith([
            new BooleanFilter({ field: 'available', operator: SearchFilterOperator.Equals, value: true }),
            new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'oat' })
        ]);
    }));

    it('should clear rows and applied filters', () => {
        component.addRow();
        setRow(0, 'name', SearchFilterOperator.Contains, 'tea');
        component.applyFilters();

        component.clearFilters();

        expect(component.rows).toHaveLength(0);
        expect(component.appliedFilters).toHaveLength(0);
        expect(component.searchTerm).toBe('');
        expect(onFiltersChange).toHaveBeenLastCalledWith([]);
    });

    it('should reset the operator and value when the row field changes', () => {
        component.addRow();
        setRow(0, 'name', SearchFilterOperator.StartsWith, 'Coffee');

        component.onFieldChange(0, buildSelectEvent('price'));

        expect(component.rows[0]).toEqual({
            fieldKey: 'price',
            operator: SearchFilterOperator.Equals,
            value: '',
            valueTo: ''
        });
    });

    it('should only offer contains/notContains operators for a tags field', () => {
        component.addRow();
        component.onFieldChange(0, buildSelectEvent('tags'));

        expect(component.getOperators(component.rows[0])).toEqual([
            SearchFilterOperator.Contains,
            SearchFilterOperator.NotContains
        ]);
    });

    it('should apply a tags filter as a string filter', () => {
        component.addRow();
        setRow(0, 'tags', SearchFilterOperator.Contains, 'invoice');

        component.applyFilters();

        expect(component.appliedFilters).toEqual([
            new StringFilter({ field: 'tags', operator: SearchFilterOperator.Contains, value: 'invoice' })
        ]);
    });

    it('should only offer equals/notEquals operators for a select field', () => {
        component.addRow();
        component.onFieldChange(0, buildSelectEvent('status'));

        expect(component.getOperators(component.rows[0])).toEqual([
            SearchFilterOperator.Equals,
            SearchFilterOperator.NotEquals
        ]);
    });

    it('should expose the configured options for a select field', () => {
        component.addRow();
        component.onFieldChange(0, buildSelectEvent('status'));

        expect(component.getFieldOptions(component.rows[0])).toEqual([
            { label: 'test.search.status.draft', value: 'draft' },
            { label: 'test.search.status.published', value: 'published' }
        ]);
    });

    it('should apply a select filter as a string filter', () => {
        component.addRow();
        setRow(0, 'status', SearchFilterOperator.Equals, 'draft');

        component.applyFilters();

        expect(component.appliedFilters).toEqual([
            new StringFilter({ field: 'status', operator: SearchFilterOperator.Equals, value: 'draft' })
        ]);
    });

    function setRow(index: number, fieldKey: string, operator: SearchFilterOperator, value: string, valueTo = ''): void {
        component.onFieldChange(index, buildSelectEvent(fieldKey));
        component.onOperatorChange(index, buildSelectEvent(operator));
        component.onValueChange(index, buildSelectEvent(value));

        if (valueTo) {
            component.onValueToChange(index, buildSelectEvent(valueTo));
        }
    }
});

function buildConfig(overrides?: { mainField?: string }): SearchConfig {
    return new SearchConfig({
        fields: [
            new SearchField({ key: 'name', type: SearchFieldType.Text }),
            new SearchField({ key: 'price', type: SearchFieldType.Number }),
            new SearchField({ key: 'available', type: SearchFieldType.Boolean }),
            new SearchField({ key: 'tags', type: SearchFieldType.Tags }),
            new SearchField({
                key: 'status',
                type: SearchFieldType.Select,
                options: [
                    { label: 'test.search.status.draft', value: 'draft' },
                    { label: 'test.search.status.published', value: 'published' }
                ]
            })
        ],
        mainField: overrides && 'mainField' in overrides ? overrides.mainField : 'name',
        onFiltersChange,
        prefix: 'test.search'
    });
}

function buildSelectEvent(value: string): Event {
    return { target: { value } } as unknown as Event;
}
