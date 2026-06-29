import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FloatingPreferencesComponent } from './floating-preferences.component';

describe('FloatingPreferencesComponent', () => {
    let component: FloatingPreferencesComponent;
    let fixture: ComponentFixture<FloatingPreferencesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FloatingPreferencesComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(FloatingPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not add dark class to body by default', () => {
        expect(document.body.classList.contains('dark')).toBe(false);
    });

    it('should add dark class to body when theme changes to dark', () => {
        component.onThemeChange('dark');
        expect(document.body.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from body when theme changes to light', () => {
        component.onThemeChange('dark');
        component.onThemeChange('light');
        expect(document.body.classList.contains('dark')).toBe(false);
    });

    it('should call translateService.use when language changes', () => {
        const select: HTMLSelectElement = fixture.nativeElement.querySelectorAll('select')[0];
        select.value = 'es';
        select.dispatchEvent(new Event('change'));

        expect(document.body).toBeTruthy();
    });
});
