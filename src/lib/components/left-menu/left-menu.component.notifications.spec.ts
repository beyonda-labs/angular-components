import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { queryButton, renderComponent } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { NotificationsConfig } from '../notifications/models/notifications.model';
import { LeftMenuComponent } from './left-menu.component';
import { LeftMenuConfig, LeftMenuConfigParameters, LeftMenuTitle, LeftMenuUserInfo } from './models/left-menu.model';

const BELL = 'angular-components.notifications.bell.unread';

describe('LeftMenuComponent with notifications', () => {
    let fixture: ComponentFixture<LeftMenuComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(overrides: Partial<LeftMenuConfigParameters> = {}): LeftMenuConfig {
        return new LeftMenuConfig({
            notifications: new NotificationsConfig({ baseUrl: '/inbox' }),
            prefix: 'demo',
            title: new LeftMenuTitle({ title: 'Demo app' }),
            ...overrides
        });
    }

    async function render(config: LeftMenuConfig): Promise<void> {
        fixture = await renderComponent(LeftMenuComponent, { config });
        httpTesting.expectOne('https://api.test/api/inbox/unread-count').flush({ unreadCount: 1 });
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LeftMenuComponent],
            providers: [provideBeyTesting({ token: 'session-token' }), provideRouter([])]
        });

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        fixture.destroy();
        httpTesting.verify();
    });

    it('shows the bell at the foot of the menu, next to the user', async () => {
        await render(buildConfig({ userInfo: new LeftMenuUserInfo({ name: 'Ada', surname: 'Lovelace' }) }));

        expect(fixture.nativeElement.querySelector('footer').textContent).toContain('Ada Lovelace');
        expect(queryButton(fixture, BELL)).not.toBeNull();
    });

    it('shows the bell at the foot of the menu with no user, collapsed as well', async () => {
        await render(buildConfig({ isExpanded: false }));

        expect(queryButton(fixture, BELL)).not.toBeNull();
    });
});
