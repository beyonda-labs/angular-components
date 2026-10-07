import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, controlByName, queryButton, renderComponent, settle } from '@testing/dom';

import { TableColumnsMenuEntry } from '../../models/table.model';
import { TableColumnsMenuComponent } from './columns-menu.component';

const ENTRIES: TableColumnsMenuEntry[] = [
    { isChecked: true, isDisabled: false, key: 'role', label: 'demo.table.columns.role' },
    { isChecked: false, isDisabled: false, key: 'joinedAt', label: 'demo.table.columns.joined-at' },
    { isChecked: true, isDisabled: true, key: 'team', label: 'demo.table.columns.team' }
];
const TOGGLE = 'angular-components.table.columns.label';

describe('TableColumnsMenuComponent', () => {
    let fixture: ComponentFixture<TableColumnsMenuComponent>;
    let toggled: string[];
    let resets: number;

    async function open(): Promise<void> {
        buttonByName(fixture, TOGGLE).click();
        await settle(fixture);
    }

    function panel(): HTMLElement | null {
        return fixture.nativeElement.querySelector('[role="group"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableColumnsMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(TableColumnsMenuComponent, { entries: ENTRIES });
        toggled = [];
        resets = 0;
        fixture.componentInstance.columnToggle.subscribe(key => toggled.push(key));
        fixture.componentInstance.columnsReset.subscribe(() => (resets += 1));
        document.body.append(fixture.nativeElement);
    });

    afterEach(() => {
        fixture.nativeElement.remove();
    });

    it('opens a checkbox per column from its toggle, focusing the first one it can change', async () => {
        expect(buttonByName(fixture, TOGGLE).getAttribute('aria-expanded')).toBe('false');
        expect(panel()).toBeNull();

        await open();

        expect(buttonByName(fixture, TOGGLE).getAttribute('aria-expanded')).toBe('true');
        expect(controlByName(fixture, 'demo.table.columns.role').checked).toBe(true);
        expect(controlByName(fixture, 'demo.table.columns.joined-at').checked).toBe(false);
        expect(controlByName(fixture, 'demo.table.columns.team').disabled).toBe(true);
        expect(document.activeElement).toBe(controlByName(fixture, 'demo.table.columns.role'));
    });

    it('reports the column whose checkbox changes and the reset to the defaults', async () => {
        await open();

        controlByName(fixture, 'demo.table.columns.joined-at').click();
        buttonByName(fixture, 'angular-components.table.columns.reset').click();

        expect(toggled).toEqual(['joinedAt']);
        expect(resets).toBe(1);
    });

    it('closes on Escape, giving the focus back to its toggle', async () => {
        await open();

        controlByName(fixture, 'demo.table.columns.role').dispatchEvent(
            new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
        );
        await settle(fixture);

        expect(panel()).toBeNull();
        expect(document.activeElement).toBe(buttonByName(fixture, TOGGLE));
    });

    it('closes on a click outside it, on a scroll around it and on its toggle', async () => {
        await open();
        document.body.click();
        await settle(fixture);
        expect(panel()).toBeNull();

        await open();
        document.dispatchEvent(new Event('scroll'));
        await settle(fixture);
        expect(panel()).toBeNull();

        await open();
        await open();
        expect(panel()).toBeNull();
        expect(queryButton(fixture, 'angular-components.table.columns.reset')).toBeNull();
    });

    it('closes when the focus leaves it', async () => {
        const outside = document.createElement('button');
        document.body.append(outside);
        await open();

        controlByName(fixture, 'demo.table.columns.role').dispatchEvent(
            new FocusEvent('focusout', { bubbles: true, relatedTarget: outside })
        );
        await settle(fixture);

        expect(panel()).toBeNull();
        outside.remove();
    });
});
