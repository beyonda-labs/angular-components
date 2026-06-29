import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingContainerComponent } from './loading-container.component';
import { LoadingService } from './services/loading.service';

describe('LoadingContainerComponent', () => {
    let component: LoadingContainerComponent;
    let fixture: ComponentFixture<LoadingContainerComponent>;
    let loadingService: LoadingService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingContainerComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingContainerComponent);
        component = fixture.componentInstance;
        loadingService = TestBed.inject(LoadingService);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not render overlay by default', () => {
        const overlay = fixture.nativeElement.querySelector('bey-loading-overlay');
        expect(overlay).toBeNull();
    });

    it('should render fullscreen overlay after show()', () => {
        loadingService.show();
        fixture.detectChanges();

        const overlay = fixture.nativeElement.querySelector('bey-loading-overlay');
        expect(overlay).toBeTruthy();

        const inner = fixture.nativeElement.querySelector('.bey-loading-overlay-fullscreen');
        expect(inner).toBeTruthy();
    });

    it('should hide overlay after matching hide()', () => {
        loadingService.show();
        fixture.detectChanges();

        loadingService.hide();
        fixture.detectChanges();

        const overlay = fixture.nativeElement.querySelector('bey-loading-overlay');
        expect(overlay).toBeNull();
    });

    it('should remain visible when multiple show() calls with partial hide()', () => {
        loadingService.show();
        loadingService.show();
        fixture.detectChanges();

        loadingService.hide();
        fixture.detectChanges();

        const overlay = fixture.nativeElement.querySelector('bey-loading-overlay');
        expect(overlay).toBeTruthy();
    });

    it('should hide after reset()', () => {
        loadingService.show();
        loadingService.show();
        fixture.detectChanges();

        loadingService.reset();
        fixture.detectChanges();

        const overlay = fixture.nativeElement.querySelector('bey-loading-overlay');
        expect(overlay).toBeNull();
    });
});
