import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { LeftMenuComponent } from './left-menu.component';
import {
    LeftMenuAction,
    LeftMenuConfig,
    LeftMenuConfigParameters,
    LeftMenuTitle,
    LeftMenuUserInfo
} from './models/left-menu.model';

const OPEN_ACCOUNT = 'angular-components.left-menu.open-account';

describe('LeftMenuComponent', () => {
    let fixture: ComponentFixture<LeftMenuComponent>;

    function buildConfig(overrides: Partial<LeftMenuConfigParameters> = {}): LeftMenuConfig {
        return new LeftMenuConfig({
            prefix: 'demo',
            title: new LeftMenuTitle({ title: 'Demo app' }),
            topActions: [new LeftMenuAction({ key: 'home', label: 'Home' })],
            bottomActions: [new LeftMenuAction({ key: 'logout', label: 'Log out' })],
            ...overrides
        });
    }

    async function render(config: LeftMenuConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(LeftMenuComponent, { config });
    }

    function toggle(): HTMLButtonElement {
        return fixture.nativeElement.querySelector(
            '[aria-label="angular-components.left-menu.collapse"], [aria-label="angular-components.left-menu.expand"]'
        );
    }

    function actionLabels(): string[] {
        return textsOf(queryAll(fixture, 'bey-left-menu-action-list button'));
    }

    function accountLink(): HTMLAnchorElement | undefined {
        return queryAll<HTMLAnchorElement>(fixture, 'a').find(link => link.getAttribute('aria-label') === OPEN_ACCOUNT);
    }

    function buildUser(route?: string): LeftMenuUserInfo {
        return new LeftMenuUserInfo({ email: 'ada@example.com', name: 'Ada', route, surname: 'Lovelace' });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuComponent, TranslateModule.forRoot()],
            providers: [provideRouter([{ children: [], path: 'account' }])]
        }).compileComponents();
    });

    it('shows the title and the actions of both groups', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Demo app');
        expect(actionLabels()).toEqual(['Home', 'Log out']);
    });

    it('starts expanded or collapsed as the config says', async () => {
        await render();
        expect(toggle().getAttribute('aria-expanded')).toBe('true');

        await render(buildConfig({ expanded: false }));
        expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('collapses and expands from its toggle, reporting each change', async () => {
        const changes: boolean[] = [];

        await render(buildConfig({ onExpandedChange: expanded => changes.push(expanded) }));
        toggle().click();
        fixture.detectChanges();
        expect(toggle().getAttribute('aria-expanded')).toBe('false');

        toggle().click();
        fixture.detectChanges();
        expect(toggle().getAttribute('aria-expanded')).toBe('true');

        expect(changes).toEqual([false, true]);
    });

    it('builds the title from the prefix when the config leaves it at its default', async () => {
        await render(buildConfig({ title: new LeftMenuTitle({}) }));

        expect(fixture.nativeElement.textContent).toContain('demo.title');
    });

    it('shows the user of the session', async () => {
        await render(
            buildConfig({
                userInfo: new LeftMenuUserInfo({ email: 'ada@example.com', name: 'Ada', surname: 'Lovelace' })
            })
        );

        expect(fixture.nativeElement.querySelector('footer').textContent).toContain('Ada Lovelace');
    });

    it('keeps the user as plain text when the config gives it no route', async () => {
        await render(buildConfig({ userInfo: buildUser() }));

        expect(accountLink()).toBeUndefined();
    });

    it('opens the route of the user from a link named for assistive technology, marked once it is the page', async () => {
        await render(buildConfig({ userInfo: buildUser('/account') }));
        const link = accountLink();

        expect(link?.getAttribute('href')).toBe('/account');
        expect(link?.textContent).toContain('Ada Lovelace');
        expect(link?.hasAttribute('aria-current')).toBe(false);

        link?.click();
        await settle(fixture);

        expect(TestBed.inject(Router).url).toBe('/account');
        expect(accountLink()?.getAttribute('aria-current')).toBe('page');
    });

    it('keeps the link to the route of the user while collapsed', async () => {
        await render(buildConfig({ expanded: false, userInfo: buildUser('/account') }));

        expect(accountLink()?.getAttribute('href')).toBe('/account');
    });

    it('shows no user area when the config carries no user', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('footer')).toBeNull();
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput(
            'config',
            buildConfig({ topActions: [new LeftMenuAction({ key: 'other', label: 'Other' })] })
        );
        await settle(fixture);

        expect(actionLabels()).toEqual(['Other', 'Log out']);
    });
});
