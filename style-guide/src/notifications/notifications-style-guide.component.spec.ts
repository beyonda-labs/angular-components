import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { NotificationsStyleGuideComponent } from './notifications-style-guide.component';

const NOTIFICATIONS = 'angular-components.notifications';
const PREFIX = 'angular-components-style-guide.notifications';

describe('NotificationsStyleGuideComponent', () => {
    let fixture: ComponentFixture<NotificationsStyleGuideComponent>;

    function bell(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
    }

    function notices(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, '[role="dialog"] li button');
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NotificationsStyleGuideComponent],
            providers: [provideBeyTesting(), provideRouter([])]
        });

        fixture = await renderComponent(NotificationsStyleGuideComponent);
    });

    it('starts with unread and read notices behind a bell that counts the unread ones', async () => {
        expect(bell().getAttribute('aria-label')).toBe(`${NOTIFICATIONS}.bell.unread`);

        await click(bell());

        expect(notices()).toHaveLength(5);
        expect(notices()[3].textContent).toContain(`${PREFIX}.types.review-requested`);
    });

    it('marks the notices read, one by opening it and then all of them', async () => {
        await click(bell());
        await click(notices()[0]);
        await click(buttonByName(fixture, `${NOTIFICATIONS}.actions.mark-all-read`));

        expect(bell().getAttribute('aria-label')).toBe(`${NOTIFICATIONS}.bell.label`);
    });

    it('shows more pages of notices, and none at all', async () => {
        await click(buttonByName(fixture, `${PREFIX}.scenarios.pages`));
        await click(bell());

        expect(notices()).toHaveLength(2);

        await click(buttonByName(fixture, `${NOTIFICATIONS}.actions.show-more`));
        await click(buttonByName(fixture, `${NOTIFICATIONS}.actions.show-more`));

        expect(notices()).toHaveLength(5);
        expect(queryButton(fixture, `${NOTIFICATIONS}.actions.show-more`)).toBeNull();

        await click(buttonByName(fixture, `${PREFIX}.scenarios.empty`));
        await click(bell());

        expect(fixture.nativeElement.textContent).toContain(`${NOTIFICATIONS}.empty`);
    });
});
