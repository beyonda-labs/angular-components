import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SearchConfig, SearchConfigParameters, SearchField, SearchFieldType } from './models/search.model';
import { BooleanFilter, NumberFilter, SearchFilterOperator, StringFilter } from './models/search-filter.model';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
    let fixture: ComponentFixture<SearchComponent>;
    let onFiltersChange: jest.Mock;

    function buildConfig(overrides: Partial<SearchConfigParameters> = {}): SearchConfig {
        return new SearchConfig({
            prefix: 'demo',
            mainField: 'name',
            onFiltersChange,
            fields: [
                new SearchField({ key: 'name', type: SearchFieldType.Text }),
                new SearchField({ key: 'age', type: SearchFieldType.Number }),
                new SearchField({ key: 'active', type: SearchFieldType.Boolean })
            ],
            ...overrides
        });
    }

    function render(config: SearchConfig = buildConfig()): void {
        fixture = TestBed.createComponent(SearchComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
    }

    function mainInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector('.bey-search-box input');
    }

    function type(element: HTMLInputElement | HTMLSelectElement, value: string): void {
        element.value = value;
        element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input'));
        fixture.detectChanges();
    }

    function openPanel(): void {
        fixture.nativeElement.querySelector('[aria-expanded]').click();
        fixture.detectChanges();
    }

    function clickByLabel(label: string): void {
        [...fixture.nativeElement.querySelectorAll<HTMLButtonElement>('button')]
            .find(button => button.textContent?.includes(label))
            ?.click();
        fixture.detectChanges();
    }

    function rows(): HTMLElement[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-search-row')];
    }

    function selectsOf(row: HTMLElement): HTMLSelectElement[] {
        return [...row.querySelectorAll<HTMLSelectElement>('select')];
    }

    function lastFilters(): unknown[] {
        return onFiltersChange.mock.calls.at(-1)?.[0] ?? [];
    }

    beforeEach(async () => {
        onFiltersChange = jest.fn();

        await TestBed.configureTestingModule({
            imports: [SearchComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('offers a quick search box only when the config names a main field', () => {
        render();
        expect(mainInput()).toBeTruthy();

        render(buildConfig({ mainField: undefined }));
        expect(mainInput()).toBeNull();
    });

    it('reports a contains filter on the main field once typing settles', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);

        expect(lastFilters()).toEqual([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'ada' })
        ]);
    }));

    it('reports nothing until typing settles', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(100);

        expect(onFiltersChange).not.toHaveBeenCalled();

        tick(200);
    }));

    it('shows the quick search as an editable row in the panel', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);
        openPanel();

        expect(rows()).toHaveLength(1);
        expect(selectsOf(rows()[0])[0].value).toBe('name');
    }));

    it('keeps an operator chosen by hand while the term keeps changing', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);
        openPanel();
        type(selectsOf(rows()[0])[1], SearchFilterOperator.EndsWith);

        type(mainInput(), 'adam');
        tick(300);

        expect(lastFilters()).toEqual([
            new StringFilter({ field: 'name', operator: SearchFilterOperator.EndsWith, value: 'adam' })
        ]);
    }));

    it('drops the quick search filter when the box is emptied', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);
        type(mainInput(), '');
        tick(300);

        expect(lastFilters()).toEqual([]);
    }));

    it('reports a filter built row by row in the panel', fakeAsync(() => {
        render();
        openPanel();
        clickByLabel('add');

        const [field, operator] = selectsOf(rows()[0]);
        type(field, 'age');
        type(operator, SearchFilterOperator.GreaterThan);
        type(rows()[0].querySelector('input') as HTMLInputElement, '30');
        clickByLabel('apply');

        expect(lastFilters()).toEqual([
            new NumberFilter({ field: 'age', operator: SearchFilterOperator.GreaterThan, value: 30 })
        ]);
    }));

    it('reports a between filter only once both bounds are there', fakeAsync(() => {
        render();
        openPanel();
        clickByLabel('add');

        const [field, operator] = selectsOf(rows()[0]);
        type(field, 'age');
        type(operator, SearchFilterOperator.Between);

        const [from, to] = [...rows()[0].querySelectorAll<HTMLInputElement>('input')];
        type(from, '20');
        clickByLabel('apply');
        expect(lastFilters()).toEqual([]);

        openPanel();
        type([...rows()[0].querySelectorAll<HTMLInputElement>('input')][1] ?? to, '40');
        clickByLabel('apply');

        expect(lastFilters()).toEqual([
            new NumberFilter({ field: 'age', operator: SearchFilterOperator.Between, value: [20, 40] })
        ]);
    }));

    it('reports a boolean filter chosen from its dropdown', fakeAsync(() => {
        render();
        openPanel();
        clickByLabel('add');

        const [field] = selectsOf(rows()[0]);
        type(field, 'active');
        type(selectsOf(rows()[0])[2], 'true');
        clickByLabel('apply');

        expect(lastFilters()).toEqual([
            new BooleanFilter({ field: 'active', operator: SearchFilterOperator.Equals, value: true })
        ]);
    }));

    it('leaves an unfinished row out of the report', fakeAsync(() => {
        render();
        openPanel();
        clickByLabel('add');
        clickByLabel('apply');

        expect(lastFilters()).toEqual([]);
    }));

    it('clears the box and every filter at once', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);
        openPanel();
        clickByLabel('clear');

        expect(lastFilters()).toEqual([]);
        expect(mainInput().value).toBe('');
    }));

    it('counts the filters in force next to the panel toggle', fakeAsync(() => {
        render();

        type(mainInput(), 'ada');
        tick(300);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-search-badge').textContent.trim()).toBe('1');
    }));

    it('closes the panel on a click outside', fakeAsync(() => {
        render();
        openPanel();
        expect(fixture.nativeElement.querySelector('.bey-search-panel')).toBeTruthy();

        document.body.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-search-panel')).toBeNull();
    }));
});
