import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FloatingPreferencesComponent } from './floating-preferences.component';

describe('FloatingPreferencesComponent', () => {
    let fixture: ComponentFixture<FloatingPreferencesComponent>;

    async function render(usePill?: boolean): Promise<void> {
        fixture = TestBed.createComponent(FloatingPreferencesComponent);

        if (usePill !== undefined) {
            fixture.componentRef.setInput('usePill', usePill);
        }

        fixture.detectChanges();
        await fixture.whenStable();
    }

    function selects(): HTMLSelectElement[] {
        return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>('select')];
    }

    function choose(select: HTMLSelectElement, value: string): void {
        select.value = value;
        select.dispatchEvent(new Event('change'));
        fixture.detectChanges();
    }

    beforeEach(async () => {
        document.body.classList.remove('dark');
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [FloatingPreferencesComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('offers a language and a theme selector', async () => {
        await render();

        expect(selects()).toHaveLength(2);
    });

    it('starts on the light theme', async () => {
        await render();

        expect(document.body.classList).not.toContain('dark');
        expect(selects()[1].value).toBe('light');
    });

    it('turns the dark theme on and off from its selector', async () => {
        await render();

        choose(selects()[1], 'dark');
        expect(document.body.classList).toContain('dark');

        choose(selects()[1], 'light');
        expect(document.body.classList).not.toContain('dark');
    });

    it('switches the application language from its selector', async () => {
        await render();
        const translate = TestBed.inject(TranslateService);
        translate.setDefaultLang('en');

        choose(selects()[0], 'es');

        expect(translate.currentLang).toBe('es');
    });

    it('follows a language changed from elsewhere', async () => {
        const translate = TestBed.inject(TranslateService);
        translate.setDefaultLang('en');
        await render();

        translate.use('es');
        fixture.detectChanges();

        expect(selects()[0].value).toBe('es');
    });

    it('wraps itself in the floating pill unless told not to', async () => {
        await render();
        expect(fixture.nativeElement.querySelector('.is-pill')).toBeTruthy();

        await render(false);
        expect(fixture.nativeElement.querySelector('.is-pill')).toBeNull();
    });

    it('names both selectors for assistive technology', async () => {
        await render();

        expect(selects().map(select => select.getAttribute('aria-label'))).toEqual([
            'angular-components.floating-preferences.language',
            'angular-components.floating-preferences.theme'
        ]);
    });
});
