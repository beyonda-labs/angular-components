import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll } from '@testing/dom';
import { of } from 'rxjs';

import { dayEnd, dayStart } from './functions/search-dates';
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
        return fixture.nativeElement.querySelector('[role="searchbox"]');
    }

    function type(element: HTMLInputElement | HTMLSelectElement, value: string): void {
        element.value = value;
        element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input'));
        fixture.detectChanges();
    }

    function toggle(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[aria-expanded]');
    }

    function openPanel(): void {
        toggle().click();
        fixture.detectChanges();
    }

    function clickByLabel(label: string): void {
        queryAll<HTMLButtonElement>(fixture, 'button')
            .find(button => button.textContent?.includes(label))
            ?.click();
        fixture.detectChanges();
    }

    function rows(): HTMLElement[] {
        return queryAll(fixture, '[role="group"]');
    }

    function selectsOf(row: HTMLElement): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(row, 'select');
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

    it('labels a camelCase field key and operator from their kebab-case segments and reports the key', fakeAsync(() => {
        render(buildConfig({ fields: [new SearchField({ key: 'createdBy', type: SearchFieldType.Text })] }));
        openPanel();
        clickByLabel('add');

        const [field, operator] = selectsOf(rows()[0]);
        const option = [...field.options].find(entry => entry.value === 'createdBy');
        type(field, 'createdBy');
        const operatorLabels = [...operator.options].map(entry => entry.textContent?.trim());
        type(operator, SearchFilterOperator.StartsWith);
        type(rows()[0].querySelector('input') as HTMLInputElement, 'ada');
        clickByLabel('apply');

        expect(option?.textContent?.trim()).toBe('demo.fields.created-by');
        expect(operatorLabels).toContain('angular-components.search.operators.starts-with');
        expect(lastFilters()).toEqual([
            new StringFilter({ field: 'createdBy', operator: SearchFilterOperator.StartsWith, value: 'ada' })
        ]);
    }));

    it('labels a field from its own label key and offers only the operators it narrows its type to', () => {
        render(
            buildConfig({
                fields: [
                    new SearchField({
                        key: 'ownerId',
                        label: 'shared.owner',
                        operators: [SearchFilterOperator.Equals],
                        options: [{ label: 'Ada', value: 'u1' }],
                        type: SearchFieldType.Select
                    })
                ]
            })
        );
        openPanel();
        clickByLabel('add');

        const [field, operator] = selectsOf(rows()[0]);
        type(field, 'ownerId');

        expect([...field.options].map(entry => entry.textContent?.trim())).toContain('shared.owner');
        expect([...operator.options].map(entry => entry.value)).toEqual([SearchFilterOperator.Equals]);
    });

    it('tells the consumer every time the panel opens, and not when it closes', () => {
        const onPanelOpen = jest.fn();
        render(buildConfig({ onPanelOpen }));

        openPanel();
        expect(onPanelOpen).toHaveBeenCalledTimes(1);

        openPanel();
        expect(onPanelOpen).toHaveBeenCalledTimes(1);

        openPanel();
        expect(onPanelOpen).toHaveBeenCalledTimes(2);
    });

    it('reports a between filter only once both bounds are there', fakeAsync(() => {
        render();
        openPanel();
        clickByLabel('add');

        const [field, operator] = selectsOf(rows()[0]);
        type(field, 'age');
        type(operator, SearchFilterOperator.Between);

        const [from, to] = queryAll<HTMLInputElement>(rows()[0], 'input');
        type(from, '20');
        clickByLabel('apply');
        expect(lastFilters()).toEqual([]);

        openPanel();
        type(queryAll<HTMLInputElement>(rows()[0], 'input')[1] ?? to, '40');
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

        expect(toggle().textContent).toContain('1');
    }));

    it('starts from the filters of its config, in the box and in the panel, without reporting them', () => {
        render(
            buildConfig({
                filters: [
                    new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'ada' }),
                    new NumberFilter({ field: 'age', operator: SearchFilterOperator.Between, value: [30, 40] })
                ]
            })
        );
        openPanel();

        expect(mainInput().value).toBe('ada');
        expect(toggle().textContent).toContain('2');
        expect(rows().map(row => selectsOf(row)[0].value)).toEqual(['name', 'age']);
        expect(queryAll<HTMLInputElement>(rows()[1], 'input').map(input => input.value)).toEqual(['30', '40']);
        expect(onFiltersChange).not.toHaveBeenCalled();
    });

    it('closes the panel on a click outside', fakeAsync(() => {
        render();
        openPanel();
        expect(toggle().getAttribute('aria-expanded')).toBe('true');

        document.body.click();
        fixture.detectChanges();

        expect(toggle().getAttribute('aria-expanded')).toBe('false');
    }));

    describe('date fields', () => {
        function buildDateConfig(overrides: Partial<SearchConfigParameters> = {}): SearchConfig {
            return buildConfig({
                fields: [new SearchField({ key: 'createdAt', type: SearchFieldType.Date })],
                mainField: undefined,
                ...overrides
            });
        }

        function dateInputs(): HTMLInputElement[] {
            return queryAll<HTMLInputElement>(rows()[0], 'input[type="date"]');
        }

        function addDateRow(operator: SearchFilterOperator): void {
            openPanel();
            clickByLabel('add');

            const [field] = selectsOf(rows()[0]);
            type(field, 'createdAt');
            type(selectsOf(rows()[0])[1], operator);
        }

        it('offers a range and both bounds, labelled as dates', () => {
            render(buildDateConfig());
            openPanel();
            clickByLabel('add');
            type(selectsOf(rows()[0])[0], 'createdAt');

            expect([...selectsOf(rows()[0])[1].options].map(entry => entry.textContent?.trim())).toEqual([
                'angular-components.search.date-operators.between',
                'angular-components.search.date-operators.greater-than-or-equals',
                'angular-components.search.date-operators.less-than-or-equals'
            ]);
        });

        it('reports a day from its first millisecond on', fakeAsync(() => {
            render(buildDateConfig());
            addDateRow(SearchFilterOperator.GreaterThanOrEquals);

            type(dateInputs()[0], '2026-10-01');
            clickByLabel('apply');

            expect(lastFilters()).toEqual([
                new NumberFilter({
                    field: 'createdAt',
                    operator: SearchFilterOperator.GreaterThanOrEquals,
                    value: dayStart('2026-10-01') ?? 0
                })
            ]);
        }));

        it('reports a day up to its last millisecond', fakeAsync(() => {
            render(buildDateConfig());
            addDateRow(SearchFilterOperator.LessThanOrEquals);

            type(dateInputs()[0], '2026-10-13');
            clickByLabel('apply');

            expect(lastFilters()).toEqual([
                new NumberFilter({
                    field: 'createdAt',
                    operator: SearchFilterOperator.LessThanOrEquals,
                    value: dayEnd('2026-10-13') ?? 0
                })
            ]);
        }));

        it('reports a range of whole days only once both days are there', fakeAsync(() => {
            render(buildDateConfig());
            addDateRow(SearchFilterOperator.Between);

            type(dateInputs()[0], '2026-10-01');
            clickByLabel('apply');
            expect(lastFilters()).toEqual([]);

            openPanel();
            type(dateInputs()[1], '2026-10-13');
            clickByLabel('apply');

            expect(lastFilters()).toEqual([
                new NumberFilter({
                    field: 'createdAt',
                    operator: SearchFilterOperator.Between,
                    value: [dayStart('2026-10-01') ?? 0, dayEnd('2026-10-13') ?? 0]
                })
            ]);
        }));

        it('starts from the days of the date filters of its config', () => {
            render(
                buildDateConfig({
                    filters: [
                        new NumberFilter({
                            field: 'createdAt',
                            operator: SearchFilterOperator.Between,
                            value: [dayStart('2026-10-01') ?? 0, dayEnd('2026-10-13') ?? 0]
                        })
                    ]
                })
            );
            openPanel();

            expect(dateInputs().map(input => input.value)).toEqual(['2026-10-01', '2026-10-13']);
        });
    });

    describe('option fields', () => {
        let searchOptions: jest.Mock;

        function buildOptionConfig(overrides: Partial<SearchConfigParameters> = {}): SearchConfig {
            return buildConfig({
                fields: [
                    new SearchField({
                        key: 'userId',
                        operators: [SearchFilterOperator.Equals],
                        searchOptions,
                        type: SearchFieldType.Autocomplete
                    })
                ],
                mainField: undefined,
                ...overrides
            });
        }

        function combobox(): HTMLInputElement {
            return rows()[0].querySelector('[role="combobox"]') as HTMLInputElement;
        }

        function options(): HTMLButtonElement[] {
            return queryAll<HTMLButtonElement>(rows()[0], '[role="option"]');
        }

        function searchFor(text: string): void {
            openPanel();
            clickByLabel('add');
            type(selectsOf(rows()[0])[0], 'userId');
            type(combobox(), text);
            tick(300);
            fixture.detectChanges();
        }

        beforeEach(() => {
            searchOptions = jest.fn(() =>
                of({
                    hasMore: true,
                    options: [
                        { label: 'Ada Lovelace (ada@example.test)', value: 'u1' },
                        { label: 'Grace Hopper (grace@example.test)', value: 'u2' }
                    ]
                })
            );
        });

        it('asks for the options of the typed text once typing settles and lists them', fakeAsync(() => {
            render(buildOptionConfig());
            searchFor(' ada ');

            expect(searchOptions).toHaveBeenCalledWith('ada');
            expect(options().map(option => option.textContent?.trim())).toEqual([
                'Ada Lovelace (ada@example.test)',
                'Grace Hopper (grace@example.test)'
            ]);
            expect(rows()[0].textContent).toContain('angular-components.search.more-matches');
        }));

        it('reports the value of the option chosen and shows its label', fakeAsync(() => {
            render(buildOptionConfig());
            searchFor('gra');

            options()[1].click();
            fixture.detectChanges();
            clickByLabel('apply');

            expect(lastFilters()).toEqual([
                new StringFilter({ field: 'userId', operator: SearchFilterOperator.Equals, value: 'u2' })
            ]);

            openPanel();

            expect(combobox().value).toBe('Grace Hopper (grace@example.test)');
        }));

        it('reports nothing for a text no option was chosen for', fakeAsync(() => {
            render(buildOptionConfig());
            searchFor('ada');

            clickByLabel('apply');

            expect(lastFilters()).toEqual([]);
        }));

        it('says so when no option matches', fakeAsync(() => {
            searchOptions.mockReturnValue(of({ options: [] }));
            render(buildOptionConfig());
            searchFor('zed');

            expect(rows()[0].textContent).toContain('angular-components.search.no-matches');
        }));

        it('starts from the value of a filter of its config, labelled by the options of the field', () => {
            render(
                buildOptionConfig({
                    fields: [
                        new SearchField({
                            key: 'userId',
                            options: [{ label: 'Ada Lovelace', value: 'u1' }],
                            searchOptions,
                            type: SearchFieldType.Autocomplete
                        })
                    ],
                    filters: [new StringFilter({ field: 'userId', operator: SearchFilterOperator.Equals, value: 'u1' })]
                })
            );
            openPanel();

            expect(combobox().value).toBe('Ada Lovelace');
        });
    });
});
