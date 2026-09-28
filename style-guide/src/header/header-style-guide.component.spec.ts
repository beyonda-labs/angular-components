import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton, renderComponent } from '@testing/dom';

import { HeaderStyleGuideComponent } from './header-style-guide.component';

const PREFIX = 'angular-components-style-guide.header';

describe('HeaderStyleGuideComponent', () => {
    let fixture: ComponentFixture<HeaderStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(HeaderStyleGuideComponent);
    });

    it('shows the default, back and sub-page examples, with a back button', () => {
        const text = fixture.nativeElement.textContent;

        expect(text).toContain(`${PREFIX}.examples.default`);
        expect(text).toContain(`${PREFIX}.examples.back`);
        expect(text).toContain(`${PREFIX}.examples.sub-page`);
        expect(queryButton(fixture, `${PREFIX}.actions.back.label`)).not.toBeNull();
    });
});
