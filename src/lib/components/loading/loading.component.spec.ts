import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingComponent } from './loading.component';
import { LoadingSize } from './models/loading.model';

describe('LoadingComponent', () => {
    let component: LoadingComponent;
    let fixture: ComponentFixture<LoadingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to medium size', () => {
        expect(component.size).toBe(LoadingSize.Md);
        expect(component.sizeValue).toBe('2.5rem');
    });

    it('should map xs size', () => {
        component.size = LoadingSize.Xs;
        expect(component.sizeValue).toBe('1rem');
    });

    it('should map sm size', () => {
        component.size = LoadingSize.Sm;
        expect(component.sizeValue).toBe('1.5rem');
    });

    it('should map lg size', () => {
        component.size = LoadingSize.Lg;
        expect(component.sizeValue).toBe('4rem');
    });

    it('should use custom size string as-is', () => {
        component.size = '3.25rem';
        expect(component.sizeValue).toBe('3.25rem');
    });

    it('should render a spinner with role="status"', () => {
        const spinner = fixture.nativeElement.querySelector('.bey-loading-spinner');
        expect(spinner).toBeTruthy();
        expect(spinner.getAttribute('role')).toBe('status');
    });

    it('should include a visually-hidden label for accessibility', () => {
        const hidden = fixture.nativeElement.querySelector('.visually-hidden');
        expect(hidden).toBeTruthy();
    });

    it('should apply the size as a CSS custom property', () => {
        const spinner: HTMLElement = fixture.nativeElement.querySelector('.bey-loading-spinner');
        expect(spinner.style.getPropertyValue('--bey-loading-size')).toBe('2.5rem');
    });
});
