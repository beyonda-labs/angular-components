import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { EditLockNoticeStyleGuideComponent } from './edit-lock-notice-style-guide.component';

const NOTICE = 'angular-components.edit-lock-notice';
const PREFIX = 'angular-components-style-guide.edit-lock-notice';

describe('EditLockNoticeStyleGuideComponent', () => {
    let fixture: ComponentFixture<EditLockNoticeStyleGuideComponent>;

    async function pick(scenario: string): Promise<void> {
        buttonByName(fixture, `${PREFIX}.scenarios.${scenario}`).click();
        await settle(fixture);
    }

    function notice(): string {
        return textsOf(queryAll(fixture, '[role="status"], [role="alert"]')).join(' ');
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [EditLockNoticeStyleGuideComponent],
            providers: [provideBeyTesting()]
        });

        fixture = await renderComponent(EditLockNoticeStyleGuideComponent);
    });

    it('starts with the lock held by the window, so no notice shows', () => {
        expect(notice()).toBe('');
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.statuses.own`);
    });

    it('shows the notice of the state picked, and its actions move it on as the real lock would', async () => {
        await pick('manager');
        TestBed.inject(FakeModalService).setConfirmationAnswer(true);
        buttonByName(fixture, `${NOTICE}.actions.release`).click();
        await settle(fixture);

        expect(notice()).toContain(`${NOTICE}.messages.free`);

        buttonByName(fixture, `${NOTICE}.actions.edit`).click();
        await settle(fixture);

        expect(notice()).toBe('');
        expect(TestBed.inject(FakeToastService).infos()).toEqual([{ message: `${PREFIX}.toast.reloaded` }]);
    });

    it('lets another window of the same user take the lock over, and a lost one save a copy', async () => {
        await pick('other-window');
        buttonByName(fixture, `${NOTICE}.actions.take-over`).click();
        await settle(fixture);

        expect(notice()).toBe('');

        await pick('taken');
        buttonByName(fixture, `${NOTICE}.actions.save-copy`).click();

        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.copy-saved` }]);
    });

    describe('at noon', () => {
        beforeEach(() => {
            jest.useFakeTimers({
                doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate', 'setInterval', 'setTimeout'],
                now: new Date(2026, 9, 11, 12, 0)
            });
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it.each([
            ['colleague', 'held.today'],
            ['earlier', 'held.earlier'],
            ['released', 'lost.released'],
            ['free', 'free'],
            ['unavailable', 'unavailable']
        ])('shows the %s state with its message', async (scenario, message) => {
            await pick(scenario);

            expect(notice()).toContain(`${NOTICE}.messages.${message}`);
        });
    });
});
