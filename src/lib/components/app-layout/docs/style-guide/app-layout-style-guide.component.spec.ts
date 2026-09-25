import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppLayoutStyleGuideComponent } from './app-layout-style-guide.component';

describe('AppLayoutStyleGuideComponent', () => {
    let fixture: ComponentFixture<AppLayoutStyleGuideComponent>;

    function breadcrumbLabels(): string[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-breadcrumb-item-label')].map(
            label => label.textContent?.trim() ?? ''
        );
    }

    beforeEach(async () => {
        global.ResizeObserver = class {
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        } as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [AppLayoutStyleGuideComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(AppLayoutStyleGuideComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('opens on the dashboard', () => {
        expect(breadcrumbLabels()).toEqual(['angular-components-style-guide.app-layout.actions.dashboard.label']);
    });

    it('navigates from the page buttons', async () => {
        const buttons = [...fixture.nativeElement.querySelectorAll<HTMLButtonElement>('bey-button button')];

        buttons[2].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(breadcrumbLabels()).toEqual(['angular-components-style-guide.app-layout.actions.reports.label']);
    });
});
