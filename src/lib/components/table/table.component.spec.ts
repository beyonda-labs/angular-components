import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { BadgeConfig, BadgeVariant } from '../badge/models/badge.model';
import { TableColumn, TableConfig, TableConfigParameters } from './models/table.model';
import { BadgeTableCell, LinkTableCell, TextTableCell } from './models/table-cell.model';
import { TableComponent } from './table.component';

interface Person {
    id: number;
    name: string;
    role: string;
}

const ADA: Person = { id: 1, name: 'Ada', role: 'Lead' };
const LINUS: Person = { id: 2, name: 'Linus', role: 'Research' };

describe('TableComponent', () => {
    let fixture: ComponentFixture<TableComponent>;

    function buildConfig(overrides: Partial<TableConfigParameters<Person>> = {}): TableConfig<Person> {
        return new TableConfig<Person>({
            columns: [new TableColumn({ key: 'name', width: 2 }), new TableColumn({ key: 'role', width: 1 })],
            items: [ADA, LINUS],
            loadRow: item => [new TextTableCell({ content: item.name }), new TextTableCell({ content: item.role })],
            prefix: 'demo.table',
            ...overrides
        });
    }

    async function render(config: TableConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(TableComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function checkboxes(): HTMLInputElement[] {
        return [...fixture.nativeElement.querySelectorAll('input[type="checkbox"]')];
    }

    function rowOf(name: string): HTMLElement {
        const found = [...fixture.nativeElement.querySelectorAll<HTMLElement>('bey-table-row')].find(row =>
            row.textContent?.includes(name)
        );

        if (!found) {
            throw new Error(`No row for ${name}`);
        }

        return found;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders the column headers from the prefix and one row per item', async () => {
        await render();
        const text = fixture.nativeElement.textContent;

        expect(text).toContain('demo.table.columns.name');
        expect(text).toContain('demo.table.columns.role');
        expect(text).toContain('Ada');
        expect(text).toContain('Linus');
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
        await settle();

        expect(selectedItemsChange).toHaveBeenLastCalledWith([LINUS], [1]);
        expect(rowOf('Linus').querySelector('input')?.checked).toBe(true);
    });

    it('selects a row by clicking anywhere on it', async () => {
        const selectedItemsChange = jest.fn();
        await render(buildConfig({ selectedItemsChange }));

        rowOf('Ada')
            .querySelector('bey-table-cell')
            ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await settle();

        expect(selectedItemsChange).toHaveBeenLastCalledWith([ADA], [0]);
    });

    it('selects and clears every row from the header, which is indeterminate in between', async () => {
        const selectedItemsChange = jest.fn();
        await render(buildConfig({ selectedItemsChange }));
        const [header] = checkboxes();

        rowOf('Ada').querySelector('input')?.click();
        await settle();
        expect(header.indeterminate).toBe(true);

        header.click();
        await settle();
        expect(selectedItemsChange).toHaveBeenLastCalledWith([ADA, LINUS], [0, 1]);
        expect(header.checked).toBe(true);

        header.click();
        await settle();
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

    it('follows a replaced config and forgets the previous selection and scroll', async () => {
        await render();
        rowOf('Ada').querySelector('input')?.click();
        await settle();
        const scroll = fixture.nativeElement.querySelector('[role="table"]') as HTMLDivElement;
        scroll.scrollTop = 120;

        fixture.componentRef.setInput('config', buildConfig({ items: [{ id: 3, name: 'Grace', role: 'Ops' }] }));
        await settle();

        expect(fixture.nativeElement.textContent).toContain('Grace');
        expect(fixture.nativeElement.textContent).not.toContain('Ada');
        expect(rowOf('Grace').querySelector('input')?.checked).toBe(false);
        expect(scroll.scrollTop).toBe(0);
    });
});
