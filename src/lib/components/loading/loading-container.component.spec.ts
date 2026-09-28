import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, settle } from '@testing/dom';

import { LoadingContainerComponent } from './loading-container.component';
import { LoadingService } from './services/loading.service';

describe('LoadingContainerComponent', () => {
    let fixture: ComponentFixture<LoadingContainerComponent>;
    let loadingService: LoadingService;

    function loadingLabel(): string | null {
        return fixture.nativeElement.querySelector('[role="status"]')?.textContent.trim() ?? null;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingContainerComponent, TranslateModule.forRoot()]
        }).compileComponents();

        loadingService = TestBed.inject(LoadingService);
        fixture = await renderComponent(LoadingContainerComponent);
    });

    it('shows no loading indicator while nothing is loading', () => {
        expect(loadingLabel()).toBeNull();
    });

    it('shows the loading indicator after show()', async () => {
        loadingService.show();
        await settle(fixture);

        expect(loadingLabel()).toBe('angular-components.loading.label');
    });

    it('hides the loading indicator after a matching hide()', async () => {
        loadingService.show();
        await settle(fixture);

        loadingService.hide();
        await settle(fixture);

        expect(loadingLabel()).toBeNull();
    });

    it('keeps the loading indicator while show() has been called more times than hide()', async () => {
        loadingService.show();
        loadingService.show();
        await settle(fixture);

        loadingService.hide();
        await settle(fixture);

        expect(loadingLabel()).toBe('angular-components.loading.label');
    });

    it('hides the loading indicator after reset()', async () => {
        loadingService.show();
        loadingService.show();
        await settle(fixture);

        loadingService.reset();
        await settle(fixture);

        expect(loadingLabel()).toBeNull();
    });
});
