import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingOverlayComponent } from './loading-overlay.component';
import { LoadingSize } from './models/loading.model';

describe('LoadingOverlayComponent', () => {
    let component: LoadingOverlayComponent;
    let fixture: ComponentFixture<LoadingOverlayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingOverlayComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingOverlayComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to container mode', () => {
        expect(component.fullscreen).toBe(false);
    });

    it('should default to large size', () => {
        expect(component.size).toBe(LoadingSize.Lg);
    });

    it('should render the overlay with role="alert" and aria-busy', () => {
        const overlay = fixture.nativeElement.querySelector('.bey-loading-overlay');
        expect(overlay).toBeTruthy();
        expect(overlay.getAttribute('role')).toBe('alert');
        expect(overlay.getAttribute('aria-busy')).toBe('true');
    });

    it('should not have fullscreen class by default', () => {
        const overlay = fixture.nativeElement.querySelector('.bey-loading-overlay');
        expect(overlay.classList.contains('bey-loading-overlay-fullscreen')).toBe(false);
    });

    it('should apply fullscreen class when fullscreen is true', () => {
        component.fullscreen = true;
        fixture.detectChanges();

        const overlay = fixture.nativeElement.querySelector('.bey-loading-overlay');
        expect(overlay.classList.contains('bey-loading-overlay-fullscreen')).toBe(true);
    });

    it('should render an inner bey-loading component', () => {
        const inner = fixture.nativeElement.querySelector('bey-loading');
        expect(inner).toBeTruthy();
    });

    it('should pass the size to the inner loading component', () => {
        component.size = LoadingSize.Sm;
        fixture.detectChanges();

        const spinner = fixture.nativeElement.querySelector('.bey-loading-spinner');
        expect(spinner.style.getPropertyValue('--bey-loading-size')).toBe('1.5rem');
    });
});
