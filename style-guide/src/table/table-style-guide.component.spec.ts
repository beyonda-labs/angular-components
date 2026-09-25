import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TableStyleGuideComponent } from './table-style-guide.component';

describe('TableStyleGuideComponent', () => {
    let fixture: ComponentFixture<TableStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TableStyleGuideComponent);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('shows the people and reflects what is opened and selected', async () => {
        expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');

        (fixture.nativeElement.querySelector('bey-table button') as HTMLButtonElement).click();
        (fixture.nativeElement.querySelectorAll('bey-table input[type="checkbox"]')[1] as HTMLInputElement).click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.componentInstance.opened()).toBe('Ada Lovelace');
        expect(fixture.componentInstance.selected()).toEqual(['Ada Lovelace']);
    });
});
