import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';

import { TableStyleGuideComponent } from './table-style-guide.component';

describe('TableStyleGuideComponent', () => {
    let fixture: ComponentFixture<TableStyleGuideComponent>;

    function rowOf(name: string, table = 0): HTMLElement {
        const found = queryAll(queryAll(fixture, 'bey-table')[table], '[role="row"]').find(row =>
            row.textContent?.includes(name)
        );

        if (!found) {
            throw new Error(`No row for ${name}`);
        }

        return found;
    }

    function firstNames(): string[] {
        return queryAll(fixture.nativeElement.querySelector('bey-table'), '[role="row"]')
            .slice(1)
            .map(row => row.querySelector('[role="cell"]')?.textContent?.trim() ?? '');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(TableStyleGuideComponent);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('shows the people and reflects what is opened and selected', async () => {
        expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');

        buttonByName(rowOf('Ada Lovelace'), 'angular-components-style-guide.table.actions.open').click();
        rowOf('Ada Lovelace').querySelector('input')?.click();
        await settle(fixture);

        expect(fixture.componentInstance.opened()).toBe('Ada Lovelace');
        expect(fixture.componentInstance.selected()).toEqual(['Ada Lovelace']);
    });

    it('shows the join dates with the locale of the app', () => {
        expect(fixture.nativeElement.textContent).toContain('Mar 14, 2021');
    });

    it('sorts the people from the header of a sortable column', async () => {
        buttonByName(fixture, 'angular-components-style-guide.table.columns.role').click();
        await settle(fixture);

        expect(firstNames()).toEqual(['Katherine Johnson', 'Grace Hopper', 'Ada Lovelace']);
    });

    it('moves a person dropped onto a team', async () => {
        rowOf('Ada Lovelace', 2).dispatchEvent(new Event('dragstart', { bubbles: true }));
        await settle(fixture);
        rowOf('Research', 2).dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
        await settle(fixture);

        expect(fixture.componentInstance.dropped()).toBe('Ada Lovelace → Research');
    });
});
