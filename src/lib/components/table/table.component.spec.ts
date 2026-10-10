import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, controlByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import { BadgeConfig, BadgeVariant } from '../badge/models/badge.model';
import { TableColumn, TableConfig, TableConfigParameters, TableSortDirection } from './models/table.model';
import { BadgeTableCell, LinkTableCell, TextTableCell } from './models/table-cell.model';
import { TableComponent } from './table.component';

interface Person {
    id: number;
    name: string;
    role: string;
}

const ADA: Person = { id: 1, name: 'Ada', role: 'Lead' };
const LINUS: Person = { id: 2, name: 'Linus', role: 'Research' };
const GRACE: Person = { id: 3, name: 'Grace', role: 'Ops' };
const COLUMNS_TOGGLE = 'angular-components.table.columns.label';

describe('TableComponent', () => {
    let fixture: ComponentFixture<TableComponent<unknown>>;

    function buildConfig(overrides: Partial<TableConfigParameters<Person>> = {}): TableConfig<Person> {
        return new TableConfig<Person>({
            columns: [new TableColumn({ key: 'name', width: 2 }), new TableColumn({ key: 'role', width: 1 })],
            items: [ADA, LINUS],
            loadRow: item => [new TextTableCell({ content: item.name }), new TextTableCell({ content: item.role })],
            prefix: 'demo.table',
            ...overrides
        });
    }

    async function render(config: TableConfig<Person> = buildConfig()): Promise<void> {
        fixture = await renderComponent(TableComponent, { config });
    }

    function checkboxes(): HTMLInputElement[] {
        return queryAll<HTMLInputElement>(fixture, 'input[type="checkbox"]');
    }

    function rowOf(name: string): HTMLElement {
        const found = queryAll(fixture, 'bey-table-row').find(row => row.textContent?.includes(name));

        if (!found) {
            throw new Error(`No row for ${name}`);
        }

        return found;
    }

    function header(name: string): HTMLElement {
        const found = queryAll(fixture, '[role="columnheader"]').find(cell => cell.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No header ${name}`);
        }

        return found;
    }

    function headerTexts(): string[] {
        return textsOf(queryAll(fixture, '[role="columnheader"]'));
    }

    function dragEvent(row: string, type: string): Event {
        const event = new Event(type, { bubbles: true, cancelable: true });

        rowOf(row).querySelector('[role="row"]')?.dispatchEvent(event);

        return event;
    }

    async function toggleColumn(name: string): Promise<void> {
        buttonByName(fixture, COLUMNS_TOGGLE).click();
        await settle(fixture);
        controlByName(fixture, name).click();
        await settle(fixture);
        buttonByName(fixture, COLUMNS_TOGGLE).click();
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    it('renders the column headers from the prefix and one row per item', async () => {
        await render();
        const text = fixture.nativeElement.textContent;

        expect(text).toContain('demo.table.columns.name');
        expect(text).toContain('demo.table.columns.role');
        expect(text).toContain('Ada');
        expect(text).toContain('Linus');
    });

    it('reads the header of a camelCase column key from its kebab-case segment', async () => {
        await render(
            buildConfig({
                columns: [new TableColumn({ key: 'createdAt' })],
                loadRow: item => [new TextTableCell({ content: item.name })]
            })
        );

        expect(fixture.nativeElement.textContent).toContain('demo.table.columns.created-at');
    });

    it('reads the header of a column with a label of its own from that key', async () => {
        await render(
            buildConfig({
                columns: [new TableColumn({ key: 'ownerName', label: 'shared.owner' })],
                loadRow: item => [new TextTableCell({ content: item.name })]
            })
        );

        expect(headerTexts()).toContain('shared.owner');
        expect(fixture.nativeElement.textContent).not.toContain('demo.table.columns.owner-name');
    });

    it('shows the empty message when there are no items', async () => {
        await render(buildConfig({ items: [] }));

        expect(fixture.nativeElement.textContent).toContain('demo.table.empty');
    });

    it('offers no checkboxes when the table is not selectable', async () => {
        await render(buildConfig({ selectable: false }));

        expect(checkboxes()).toHaveLength(0);
    });

    it('reports the selected items and their indexes as rows are ticked', async () => {
        const selectedItemsChange = jest.fn();
        await render(buildConfig({ selectedItemsChange }));

        rowOf('Linus').querySelector('input')?.click();
        await settle(fixture);

        expect(selectedItemsChange).toHaveBeenLastCalledWith([LINUS], [1]);
        expect(rowOf('Linus').querySelector('input')?.checked).toBe(true);
    });

    it('draws its rows again when the language changes, keeping the selection', async () => {
        const loadRow = jest.fn((item: Person) => [new TextTableCell({ content: item.name })]);
        await render(buildConfig({ loadRow }));

        rowOf('Linus').querySelector('input')?.click();
        await settle(fixture);
        loadRow.mockClear();
        TestBed.inject(TranslateService).use('es');
        await settle(fixture);

        expect(loadRow).toHaveBeenCalledTimes(2);
        expect(rowOf('Linus').querySelector('input')?.checked).toBe(true);
    });

    it('selects a row by clicking anywhere on it', async () => {
        const selectedItemsChange = jest.fn();
        await render(buildConfig({ selectedItemsChange }));

        rowOf('Ada')
            .querySelector('bey-table-cell')
            ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await settle(fixture);

        expect(selectedItemsChange).toHaveBeenLastCalledWith([ADA], [0]);
    });

    it('selects and clears every row from the header, which is indeterminate in between', async () => {
        const selectedItemsChange = jest.fn();
        await render(buildConfig({ selectedItemsChange }));
        const [header] = checkboxes();

        rowOf('Ada').querySelector('input')?.click();
        await settle(fixture);
        expect(header.indeterminate).toBe(true);

        header.click();
        await settle(fixture);
        expect(selectedItemsChange).toHaveBeenLastCalledWith([ADA, LINUS], [0, 1]);
        expect(header.checked).toBe(true);

        header.click();
        await settle(fixture);
        expect(selectedItemsChange).toHaveBeenLastCalledWith([], []);
    });

    it('starts with the rows the config marks as selected', async () => {
        await render(buildConfig({ isRowSelected: item => item.id === 2 }));

        expect(rowOf('Ada').querySelector('input')?.checked).toBe(false);
        expect(rowOf('Linus').querySelector('input')?.checked).toBe(true);
    });

    it('runs the action of a link cell without selecting the row', async () => {
        const action = jest.fn();
        const selectedItemsChange = jest.fn();
        await render(
            buildConfig({
                loadRow: item => [new LinkTableCell({ action, content: item.name })],
                selectedItemsChange
            })
        );

        (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

        expect(action).toHaveBeenCalled();
        expect(selectedItemsChange).not.toHaveBeenCalled();
    });

    it('renders every badge of a badge cell', async () => {
        await render(
            buildConfig({
                items: [ADA],
                loadRow: () => [
                    new BadgeTableCell({
                        badges: [
                            new BadgeConfig({ label: 'Angular', variant: BadgeVariant.Primary }),
                            new BadgeConfig({ label: 'RxJS', variant: BadgeVariant.Info })
                        ]
                    })
                ]
            })
        );

        expect(fixture.nativeElement.textContent).toContain('Angular');
        expect(fixture.nativeElement.textContent).toContain('RxJS');
    });

    it('fills a row that has fewer cells than columns with empty cells', async () => {
        await render(buildConfig({ items: [ADA], loadRow: item => [new TextTableCell({ content: item.name })] }));

        expect(textsOf(queryAll(rowOf('Ada'), '[role="cell"]'))).toEqual(['Ada', '']);
    });

    it('follows a replaced config and forgets the previous selection and scroll', async () => {
        await render();
        rowOf('Ada').querySelector('input')?.click();
        await settle(fixture);
        const scroll = fixture.nativeElement.querySelector('[role="table"]') as HTMLDivElement;
        scroll.scrollTop = 120;

        fixture.componentRef.setInput('config', buildConfig({ items: [{ id: 3, name: 'Grace', role: 'Ops' }] }));
        await settle(fixture);

        expect(fixture.nativeElement.textContent).toContain('Grace');
        expect(fixture.nativeElement.textContent).not.toContain('Ada');
        expect(rowOf('Grace').querySelector('input')?.checked).toBe(false);
        expect(scroll.scrollTop).toBe(0);
    });

    describe('sort', () => {
        function buildSortableConfig(overrides: Partial<TableConfigParameters<Person>> = {}): TableConfig<Person> {
            return buildConfig({
                columns: [new TableColumn({ isSortable: true, key: 'name' }), new TableColumn({ key: 'role' })],
                ...overrides
            });
        }

        it('sorts from the header button of a sortable column, ascending, descending and back to none', async () => {
            const onSortChange = jest.fn();
            await render(buildSortableConfig({ onSortChange }));

            expect(header('demo.table.columns.name').getAttribute('aria-sort')).toBe('none');
            expect(header('demo.table.columns.role').hasAttribute('aria-sort')).toBe(false);
            expect(queryButton(header('demo.table.columns.role'), 'demo.table.columns.role')).toBeNull();

            const states: (string | null)[] = [];
            const clickName = async (): Promise<void> => {
                buttonByName(fixture, 'demo.table.columns.name').click();
                await settle(fixture);
                states.push(header('demo.table.columns.name').getAttribute('aria-sort'));
            };

            await clickName();
            await clickName();
            await clickName();

            expect(states).toEqual(['ascending', 'descending', 'none']);
            expect(onSortChange.mock.calls).toEqual([
                [{ direction: TableSortDirection.Asc, field: 'name' }],
                [{ direction: TableSortDirection.Desc, field: 'name' }],
                [null]
            ]);
        });

        it('shows the sort its config gives, by the sort field of the column', async () => {
            await render(
                buildConfig({
                    columns: [new TableColumn({ isSortable: true, key: 'name', sortField: 'lastName' })],
                    sort: { direction: TableSortDirection.Desc, field: 'lastName' }
                })
            );

            expect(header('demo.table.columns.name').getAttribute('aria-sort')).toBe('descending');
        });
    });

    describe('columns', () => {
        function buildColumnsConfig(overrides: Partial<TableConfigParameters<Person>> = {}): TableConfig<Person> {
            return buildConfig({
                columns: [
                    new TableColumn({ isHideable: false, key: 'name' }),
                    new TableColumn({ key: 'role', width: '8rem' }),
                    new TableColumn({ isVisible: false, key: 'id' })
                ],
                loadRow: item => [
                    new TextTableCell({ content: item.name }),
                    new TextTableCell({ content: item.role }),
                    new TextTableCell({ content: `#${item.id}` })
                ],
                storageKey: 'people',
                ...overrides
            });
        }

        it('offers the columns menu only to a table with a storage key, listing its hideable columns', async () => {
            await render();
            expect(queryButton(fixture, COLUMNS_TOGGLE)).toBeNull();

            await render(buildColumnsConfig());
            buttonByName(fixture, COLUMNS_TOGGLE).click();
            await settle(fixture);

            expect(controlByName(fixture, 'demo.table.columns.role').checked).toBe(true);
            expect(controlByName(fixture, 'demo.table.columns.id').checked).toBe(false);
            expect(() => controlByName(fixture, 'demo.table.columns.name')).toThrow();
        });

        it('hides and shows columns from the menu, keeping the selection', async () => {
            await render(buildColumnsConfig());
            rowOf('Ada').querySelector('input')?.click();
            await settle(fixture);

            expect(headerTexts()).toEqual(['demo.table.columns.name', 'demo.table.columns.role']);

            await toggleColumn('demo.table.columns.role');
            await toggleColumn('demo.table.columns.id');

            expect(headerTexts()).toEqual(['demo.table.columns.name', 'demo.table.columns.id']);
            expect(textsOf(queryAll(rowOf('Ada'), '[role="cell"]'))).toEqual(['Ada', '#1']);
            expect(rowOf('Ada').querySelector('input')?.checked).toBe(true);
        });

        it('remembers the choice for the next table with the same key, until it is reset', async () => {
            await render(buildColumnsConfig());
            await toggleColumn('demo.table.columns.role');

            await render(buildColumnsConfig());
            expect(headerTexts()).toEqual(['demo.table.columns.name']);

            buttonByName(fixture, COLUMNS_TOGGLE).click();
            await settle(fixture);
            buttonByName(fixture, 'angular-components.table.columns.reset').click();
            await settle(fixture);
            expect(headerTexts()).toEqual(['demo.table.columns.name', 'demo.table.columns.role']);

            await render(buildColumnsConfig());
            expect(headerTexts()).toEqual(['demo.table.columns.name', 'demo.table.columns.role']);
        });

        it('keeps the last visible column from being hidden', async () => {
            await render(
                buildColumnsConfig({
                    columns: [new TableColumn({ key: 'name' }), new TableColumn({ isVisible: false, key: 'role' })]
                })
            );
            buttonByName(fixture, COLUMNS_TOGGLE).click();
            await settle(fixture);

            expect(controlByName(fixture, 'demo.table.columns.name').disabled).toBe(true);
        });

        it('starts from the defaults when the storage cannot be read', async () => {
            localStorage.setItem('bey-table-columns.people', JSON.stringify({ role: false }));
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('denied');
            });

            await render(buildColumnsConfig());

            expect(headerTexts()).toEqual(['demo.table.columns.name', 'demo.table.columns.role']);
        });
    });

    describe('drag and drop', () => {
        let onRowDrop: jest.Mock;

        beforeEach(async () => {
            onRowDrop = jest.fn();
            await render(
                buildConfig({
                    isDropAllowed: target => target.id === LINUS.id,
                    isRowDraggable: item => item.id !== LINUS.id,
                    items: [ADA, LINUS, GRACE],
                    onRowDrop
                })
            );
        });

        it('drops the dragged row onto a row that accepts it', async () => {
            dragEvent('Ada', 'dragstart');
            await settle(fixture);

            expect(dragEvent('Linus', 'dragover').defaultPrevented).toBe(true);

            dragEvent('Linus', 'drop');

            expect(onRowDrop).toHaveBeenCalledWith(LINUS, [ADA]);
        });

        it('drags the whole selection when the dragged row is selected', async () => {
            rowOf('Ada').querySelector('input')?.click();
            rowOf('Grace').querySelector('input')?.click();
            await settle(fixture);

            dragEvent('Grace', 'dragstart');
            await settle(fixture);
            dragEvent('Linus', 'drop');

            expect(onRowDrop).toHaveBeenCalledWith(LINUS, [ADA, GRACE]);
        });

        it('refuses a drop on a row that does not accept it, and a drag of a row that cannot move', async () => {
            dragEvent('Ada', 'dragstart');
            await settle(fixture);

            expect(dragEvent('Grace', 'dragover').defaultPrevented).toBe(false);
            dragEvent('Grace', 'drop');

            dragEvent('Ada', 'dragend');
            dragEvent('Linus', 'dragstart');
            await settle(fixture);
            dragEvent('Linus', 'drop');

            expect(onRowDrop).not.toHaveBeenCalled();
        });

        it('forgets the drag once it ends', async () => {
            dragEvent('Ada', 'dragstart');
            await settle(fixture);
            dragEvent('Linus', 'dragover');
            await settle(fixture);
            dragEvent('Linus', 'dragleave');
            dragEvent('Ada', 'dragend');
            await settle(fixture);

            expect(dragEvent('Linus', 'dragover').defaultPrevented).toBe(false);
        });
    });
});
