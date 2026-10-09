import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';

import { LeftMenuStyleGuideComponent } from './left-menu-style-guide.component';

const PREFIX = 'angular-components-style-guide.left-menu';

describe('LeftMenuStyleGuideComponent', () => {
    let fixture: ComponentFixture<LeftMenuStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuStyleGuideComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = await renderComponent(LeftMenuStyleGuideComponent);
    });

    it('runs the documents action when its label is clicked', async () => {
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.documents-clicked`);

        buttonByName(fixture, `${PREFIX}.actions.documents.label`).click();
        await settle(fixture);

        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.documents-clicked`);
    });

    it('links the user of both menus to the page the demo is on, marked as the current one', async () => {
        await TestBed.inject(Router).navigateByUrl('/');
        await settle(fixture);

        const links = queryAll<HTMLAnchorElement>(fixture, 'a').filter(
            link => link.getAttribute('aria-label') === 'angular-components.left-menu.open-account'
        );

        expect(links.map(link => link.getAttribute('href'))).toEqual(['/', '/']);
        expect(links.map(link => link.getAttribute('aria-current'))).toEqual(['page', 'page']);
    });
});
