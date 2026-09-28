import '@angular/common/locales/global/es';

import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { BadgeConfig, BadgeVariant } from '../../../badge/models/badge.model';
import {
    BadgeTableCell,
    DateTableCell,
    LinkTableCell,
    TableCell,
    TagsTableCell,
    TextTableCell
} from '../../models/table-cell.model';
import { TableCellComponent } from './cell.component';

const SEPTEMBER_28 = Date.UTC(2026, 8, 28, 12);

describe('TableCellComponent', () => {
    let fixture: ComponentFixture<TableCellComponent>;

    async function render(cell: TableCell): Promise<void> {
        const translateService = TestBed.inject(TranslateService);

        translateService.setTranslation('en', { demo: { open: 'Open', active: 'Active' } });
        translateService.use('en');
        fixture = await renderComponent(TableCellComponent, { cell });
    }

    function text(): string {
        return fixture.nativeElement.textContent.trim();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableCellComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('shows a text cell as it is, or translated when asked', async () => {
        await render(new TextTableCell({ content: 'demo.open' }));
        expect(text()).toBe('demo.open');

        await render(new TextTableCell({ content: 'demo.open', translate: true }));
        expect(text()).toBe('Open');
    });

    it('shows nothing for an empty content', async () => {
        await render(new TextTableCell({ content: null as never }));

        expect(text()).toBe('');
    });

    it('runs the action of a link cell', async () => {
        const action = jest.fn();
        await render(new LinkTableCell({ action, content: 'demo.open', translate: true }));
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        button.click();

        expect(button.textContent?.trim()).toBe('Open');
        expect(action).toHaveBeenCalled();
    });

    it('shows every badge of a badge cell', async () => {
        await render(
            new BadgeTableCell({
                badges: [
                    new BadgeConfig({ label: 'demo.active', variant: BadgeVariant.Success }),
                    new BadgeConfig({ label: 'demo.open', variant: BadgeVariant.Info })
                ],
                translate: true
            })
        );

        expect(text()).toContain('Active');
        expect(text()).toContain('Open');
    });

    it('shows every tag of a tags cell as it is, never translated', async () => {
        await render(new TagsTableCell({ tags: ['demo.open', 'Angular'] }));

        expect(text()).toContain('demo.open');
        expect(text()).toContain('Angular');
    });

    it('formats a date cell in the medium format unless the cell names another one', async () => {
        await render(new DateTableCell({ value: SEPTEMBER_28 }));
        expect(text()).toBe('Sep 28, 2026');

        await render(new DateTableCell({ format: 'yyyy-MM-dd', value: new Date(SEPTEMBER_28).toISOString() }));
        expect(text()).toBe('2026-09-28');
    });

    it('formats a date cell with the locale of the app', async () => {
        TestBed.overrideProvider(LOCALE_ID, { useValue: 'es' });

        await render(new DateTableCell({ value: new Date(SEPTEMBER_28) }));

        expect(text()).toBe('28 sept 2026');
    });

    it('shows nothing for a date cell without a value', async () => {
        await render(new DateTableCell({ value: null }));

        expect(text()).toBe('');
    });
});
