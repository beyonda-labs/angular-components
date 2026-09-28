import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { LeftMenuStyleGuideComponent } from './left-menu-style-guide.component';

const PREFIX = 'angular-components-style-guide.left-menu';

describe('LeftMenuStyleGuideComponent', () => {
    let fixture: ComponentFixture<LeftMenuStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(LeftMenuStyleGuideComponent);
    });

    it('runs the documents action when its label is clicked', async () => {
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.documents-clicked`);

        buttonByName(fixture, `${PREFIX}.actions.documents.label`).click();
        await settle(fixture);

        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.documents-clicked`);
    });
});
