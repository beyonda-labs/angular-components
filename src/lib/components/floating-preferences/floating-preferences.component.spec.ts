import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { queryAll, renderComponent, textsOf } from '@testing/dom';
import { TestingConfig } from '@testing/models/testing.model';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG } from '../../services/preferences/models/preferences.model';
import { FloatingPreferencesComponent } from './floating-preferences.component';

describe('FloatingPreferencesComponent', () => {
    let fixture: ComponentFixture<FloatingPreferencesComponent>;

    async function render(usePill?: boolean): Promise<void> {
        fixture = await renderComponent(FloatingPreferencesComponent, usePill === undefined ? {} : { usePill });
    }

    function selects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(fixture, 'select');
    }

    function choose(select: HTMLSelectElement, value: string): void {
        select.value = value;
        select.dispatchEvent(new Event('change'));
        fixture.detectChanges();
    }

    async function setup(testing: TestingConfig = {}, languages?: string[]): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [FloatingPreferencesComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting(testing),
                {
                    provide: PREFERENCES_CONFIG,
                    useValue: {
                        ...DEFAULT_PREFERENCES_CONFIG,
                        languages: languages ?? DEFAULT_PREFERENCES_CONFIG.languages
                    }
                }
            ]
        }).compileComponents();
    }

    beforeEach(() => {
        document.body.classList.remove('dark');
        localStorage.clear();
    });

    it('offers the languages of the app, each named in itself, and the themes', async () => {
        await setup({}, ['es', 'en']);
        await render();

        expect(textsOf([...selects()[0].options])).toEqual(['Español', 'English']);
        expect(selects()[0].value).toBe('en');
        expect(selects()[1].value).toBe('light');
    });

    it('turns the dark theme on and off from its selector', async () => {
        await setup();
        await render();

        choose(selects()[1], 'dark');
        expect(document.body.classList).toContain('dark');

        choose(selects()[1], 'light');
        expect(document.body.classList).not.toContain('dark');
    });

    it('switches the application language from its selector', async () => {
        await setup();
        await render();

        choose(selects()[0], 'es');

        expect(TestBed.inject(TranslateService).currentLang).toBe('es');
    });

    it('saves what a signed-in user picks to their account', async () => {
        await setup({ user: { allowedPaths: ['/home'], email: 'ada@example.test', redirectPath: '/home' } });
        await render();
        const httpTesting = TestBed.inject(HttpTestingController);

        choose(selects()[1], 'dark');

        expect(httpTesting.expectOne('https://api.test/api/account').request.body).toEqual({ theme: 'dark' });
        httpTesting.verify();
    });

    it('follows a language changed from elsewhere', async () => {
        await setup();
        await render();

        TestBed.inject(TranslateService).use('es');
        fixture.detectChanges();

        expect(selects()[0].value).toBe('es');
    });

    it('wraps itself in the floating pill unless told not to', async () => {
        await setup();
        await render();
        expect(fixture.nativeElement.querySelector('.is-pill')).toBeTruthy();

        await render(false);
        expect(fixture.nativeElement.querySelector('.is-pill')).toBeNull();
    });

    it('names both selectors for assistive technology', async () => {
        await setup();
        await render();

        expect(selects().map(select => select.getAttribute('aria-label'))).toEqual([
            'angular-components.floating-preferences.language',
            'angular-components.floating-preferences.theme'
        ]);
    });
});
