import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { AppLayoutStyleGuideComponent } from './app-layout-style-guide.component';

describe('AppLayoutStyleGuideComponent', () => {
    let fixture: ComponentFixture<AppLayoutStyleGuideComponent>;

    function breadcrumbLabels(): string[] {
        return textsOf(queryAll(fixture, 'bey-breadcrumb li:not([aria-hidden="true"])'));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppLayoutStyleGuideComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = await renderComponent(AppLayoutStyleGuideComponent);
    });

    it('opens on the dashboard', () => {
        expect(breadcrumbLabels()).toEqual(['angular-components-style-guide.app-layout.actions.dashboard.label']);
    });

    it('navigates from the page buttons', async () => {
        buttonByName(fixture, 'angular-components-style-guide.app-layout.actions.reports.label').click();
        await settle(fixture);

        expect(breadcrumbLabels()).toEqual(['angular-components-style-guide.app-layout.actions.reports.label']);
    });
});
