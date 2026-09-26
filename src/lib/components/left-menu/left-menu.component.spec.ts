import { ComponentFixture, TestBed } from '@angular/core/testing';
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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuComponent, TranslateModule.forRoot()]
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
