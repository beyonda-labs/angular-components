import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TableRow } from '../../models/table.model';
import { TextTableCell } from '../../models/table-cell.model';
import { TableRowComponent } from './row.component';

describe('TableRowComponent', () => {
    let fixture: ComponentFixture<TableRowComponent>;
    let changes: boolean[];

    async function render(
        overrides: { isHeader?: boolean; selectable?: boolean; selected?: boolean } = {}
    ): Promise<void> {
        fixture = TestBed.createComponent(TableRowComponent);
        fixture.componentRef.setInput('gridTemplateColumns', '3.25rem minmax(0, 1fr)');
        fixture.componentRef.setInput('isHeader', overrides.isHeader ?? false);
        fixture.componentRef.setInput(
            'row',
            new TableRow<{ name: string }>({
                cells: [new TextTableCell({ content: 'Ada' })],
                content: { name: 'Ada' },
                selected: overrides.selected ?? false
            })
        );
        fixture.componentRef.setInput('selectable', overrides.selectable ?? true);
        changes = [];
        fixture.componentInstance.selectionChange.subscribe(value => changes.push(value));
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function checkbox(): HTMLInputElement | null {
        return fixture.nativeElement.querySelector('input[type="checkbox"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableRowComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders its cells and a labelled checkbox', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Ada');
        expect(checkbox()?.getAttribute('aria-label')).toBe('angular-components.table.select-row');
    });

    it('reports the opposite of its selection when clicked, and the checkbox state when ticked', async () => {
        await render({ selected: true });

        (fixture.nativeElement.querySelector('.bey-table-row') as HTMLElement).click();
        checkbox()?.click();

        expect(changes).toEqual([false, false]);
    });

    it('ignores clicks when it is a header or not selectable', async () => {
        await render({ isHeader: true });
        (fixture.nativeElement.querySelector('.bey-table-row') as HTMLElement).click();
        expect(changes).toEqual([]);

        await render({ selectable: false });
        (fixture.nativeElement.querySelector('.bey-table-row') as HTMLElement).click();
        expect(changes).toEqual([]);
        expect(checkbox()).toBeNull();
    });
});
