import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, settle } from '@testing/dom';

import { TableStyleGuideComponent } from './table-style-guide.component';

describe('TableStyleGuideComponent', () => {
    let fixture: ComponentFixture<TableStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(TableStyleGuideComponent);
    });

    it('shows the people and reflects what is opened and selected', async () => {
        expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');

        (fixture.nativeElement.querySelector('bey-table button') as HTMLButtonElement).click();
        (fixture.nativeElement.querySelectorAll('bey-table input[type="checkbox"]')[1] as HTMLInputElement).click();
        await settle(fixture);

        expect(fixture.componentInstance.opened()).toBe('Ada Lovelace');
        expect(fixture.componentInstance.selected()).toEqual(['Ada Lovelace']);
    });

    it('shows the join dates with the locale of the app and the skills as tags', () => {
        expect(fixture.nativeElement.textContent).toContain('Mar 14, 2021');
        expect(fixture.nativeElement.textContent).toContain('TypeScript');
    });
});
