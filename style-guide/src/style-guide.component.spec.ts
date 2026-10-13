import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, hostOf, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { StyleGuideComponent } from './style-guide.component';

const BUNDLE_URL = 'assets/angular-components/i18n-style-guide/angular-components-style-guide.en.json';
const RENDER_TIMEOUT = 20_000;
const TEXTS = {
    'angular-components-style-guide': {
        'administration-section': 'Administration',
        'badge-section': 'Badges',
        'collapse-all': 'Collapse all',
        'expand-all': 'Expand all',
        'tabs-section': 'Tabs',
        title: 'Style guide'
    }
};

describe('StyleGuideComponent', () => {
    let fixture: ComponentFixture<StyleGuideComponent>;
    let httpTesting: HttpTestingController;
    let scrolled: Element[];

    async function render(): Promise<void> {
        fixture = await renderComponent(StyleGuideComponent);
        httpTesting.expectOne(BUNDLE_URL).flush(TEXTS);
        await settle(fixture);
    }

    function expandedStates(): (string | null)[] {
        return [...new Set(toggles().map(toggle => toggle.getAttribute('aria-expanded')))];
    }

    function isExpanded(title: string): boolean {
        return buttonByName(fixture, title).getAttribute('aria-expanded') === 'true';
    }

    function toggles(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'h3 > button[aria-expanded]');
    }

    beforeEach(async () => {
        sessionStorage.clear();
        scrolled = [];
        Element.prototype.scrollIntoView = function (this: Element): void {
            scrolled.push(this);
        };

        await TestBed.configureTestingModule({
            imports: [StyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }, RENDER_TIMEOUT);

    afterEach(() => {
        httpTesting.verify();
        history.replaceState(null, '', location.pathname);
    });

    it(
        'renders every section collapsed once its own translations are merged',
        async () => {
            fixture = await renderComponent(StyleGuideComponent);

            expect(fixture.nativeElement.textContent.trim()).toBe('');

            httpTesting.expectOne(BUNDLE_URL).flush(TEXTS);
            await settle(fixture);

            expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Style guide');
            expect(expandedStates()).toEqual(['false']);
            expect(isExpanded('Administration')).toBe(false);
        },
        RENDER_TIMEOUT
    );

    it(
        'opens a section from its header, rendering its demo',
        async () => {
            await render();

            buttonByName(fixture, 'Badges').click();
            await settle(fixture);

            const body = hostOf(fixture).querySelector(
                `#${buttonByName(fixture, 'Badges').getAttribute('aria-controls')}`
            );

            expect(isExpanded('Badges')).toBe(true);
            expect(body?.textContent).toContain('angular-components-style-guide.badge.example');
            expect(isExpanded('Tabs')).toBe(false);
        },
        RENDER_TIMEOUT
    );

    it(
        'opens the section named in the hash and scrolls to it',
        async () => {
            history.replaceState(null, '', '#badge');

            await render();

            expect(isExpanded('Badges')).toBe(true);
            expect(scrolled).toEqual([buttonByName(fixture, 'Badges').closest('bey-style-guide-section')]);
        },
        RENDER_TIMEOUT
    );

    it(
        'opens the section a link points to while the style guide is open',
        async () => {
            await render();

            history.replaceState(null, '', '#tabs');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            await settle(fixture);

            expect(isExpanded('Tabs')).toBe(true);
            expect(isExpanded('Badges')).toBe(false);
        },
        RENDER_TIMEOUT
    );

    it(
        'keeps the sections left open in the session',
        async () => {
            sessionStorage.setItem('bey-style-guide-open-sections', JSON.stringify(['tabs']));

            await render();

            expect(isExpanded('Tabs')).toBe(true);
            expect(isExpanded('Badges')).toBe(false);
        },
        RENDER_TIMEOUT
    );

    it(
        'renders every demo once every section is expanded, and collapses them all',
        async () => {
            await render();

            buttonByName(fixture, 'Expand all').click();
            fixture.detectChanges();
            httpTesting.expectOne('https://api.test/auth/providers').flush([]);
            httpTesting.expectOne('https://api.test/auth/register/fields').flush([]);
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/products')
                .flush({ globalActions: [], results: [] });
            httpTesting.expectOne('https://api.test/api/products/organizations').flush({ organizations: [] });
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/style-guide/organizations')
                .flush({ globalActions: [], results: [] });
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/style-guide/groups')
                .flush({ globalActions: [], results: [] });
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/style-guide/audit')
                .flush({ globalActions: ['export'], results: [] });
            httpTesting
                .expectOne('https://api.test/api/style-guide/organizations/current')
                .flush(null, { status: 404, statusText: 'Not Found' });
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/product-categories')
                .flush({ globalActions: [], results: [] });
            httpTesting.expectOne('https://api.test/api/style-guide/account').flush({
                email: 'ada@example.test',
                hasPassword: true,
                id: 'u1',
                roles: []
            });
            httpTesting.expectOne('https://api.test/api/style-guide/users/roles').flush({ roles: [] });
            fixture.detectChanges();
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/style-guide/users')
                .flush({ globalActions: [], results: [] });
            httpTesting.expectOne('https://api.test/api/style-guide/roles/permissions').flush({ permissions: [] });
            fixture.detectChanges();
            httpTesting
                .expectOne(request => request.url === 'https://api.test/api/style-guide/roles')
                .flush({ globalActions: [], results: [] });
            httpTesting.expectOne('https://api.test/auth/password-policy').flush({ minLength: 8 });

            expect(expandedStates()).toEqual(['true']);

            buttonByName(fixture, 'Collapse all').click();
            fixture.detectChanges();

            expect(expandedStates()).toEqual(['false']);
        },
        RENDER_TIMEOUT
    );
});
