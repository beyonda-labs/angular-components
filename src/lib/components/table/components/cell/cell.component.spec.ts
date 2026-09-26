import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { BadgeConfig, BadgeVariant } from '../../../badge/models/badge.model';
import { BadgeTableCell, LinkTableCell, TableCell, TextTableCell } from '../../models/table-cell.model';
import { TableCellComponent } from './cell.component';

describe('TableCellComponent', () => {
    let fixture: ComponentFixture<TableCellComponent>;

    async function render(cell: TableCell): Promise<void> {
        fixture = await renderComponent(TableCellComponent, { cell });
    }

    function text(): string {
        return fixture.nativeElement.textContent.trim();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableCellComponent, TranslateModule.forRoot()]
        }).compileComponents();

        TestBed.inject(TranslateService).setTranslation('en', { demo: { open: 'Open', active: 'Active' } });
        TestBed.inject(TranslateService).use('en');
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
});
