import { HttpRequest } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { EditLockService } from '../../services/edit-lock/edit-lock.service';
import { EditLock } from '../../services/edit-lock/models/edit-lock.model';
import editLockNoticeEn from './assets/edit-lock-notice.en.json';
import { EditLockNoticeComponent } from './edit-lock-notice.component';
import { EditLockNoticeConfig, EditLockNoticeConfigParameters } from './models/edit-lock-notice.model';

const LOCK_URL = 'https://api.test/api/templates/t1/lock';
const NOW = new Date(2026, 9, 11, 10, 0);

const OWN: EditLock = {
    acquiredAt: new Date(2026, 9, 11, 9, 5).getTime(),
    canRelease: true,
    expiresAt: NOW.getTime() + 120000,
    holderId: 'u1',
    holderName: 'Ada Lovelace',
    isOwn: true,
    isSameUser: true
};
const OTHER_WINDOW: EditLock = { ...OWN, isOwn: false };
const COLLEAGUE: EditLock = {
    ...OWN,
    canRelease: false,
    holderId: 'u2',
    holderName: 'Grace Hopper',
    isOwn: false,
    isSameUser: false
};
const RELEASABLE: EditLock = { ...COLLEAGUE, canRelease: true };

const TEXTS = {
    'angular-components': { ...editLockNoticeEn['angular-components'], 'user-name': { unknown: 'Unknown' } },
    demo: {
        lock: {
            actions: { edit: 'Edit', release: 'Release', 'save-copy': 'Save as a copy', 'take-over': 'Edit here' },
            messages: {
                free: 'It is free.',
                held: { earlier: '{{name}} since {{date}} at {{time}}.', today: '{{name}} since {{time}}.' },
                lost: { 'other-window': 'Moved to another window.', released: 'Released.', taken: '{{name}} took it.' },
                'other-window': 'In another window.',
                unavailable: 'Gone.'
            },
            'release-confirmation': {
                confirm: 'Release it',
                message: 'Release {{name}}?',
                title: 'Release the editing'
            }
        }
    }
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EditLockNoticeComponent],
    providers: [EditLockService],
    selector: 'bey-edit-lock-notice-host',
    template: '<bey-edit-lock-notice [config]="config()" />'
})
class HostComponent {
    readonly editLockService = inject(EditLockService);

    readonly config = input.required<EditLockNoticeConfig>();
}

describe('EditLockNoticeComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(overrides: Partial<EditLockNoticeConfigParameters> = {}): EditLockNoticeConfig {
        return new EditLockNoticeConfig({ prefix: 'demo.lock', ...overrides });
    }

    function lockRequest(method: string): TestRequest {
        return httpTesting.expectOne(
            (request: HttpRequest<unknown>) => request.method === method && request.url === LOCK_URL
        );
    }

    async function answer(method: string, lock: EditLock | null): Promise<void> {
        lockRequest(method).flush({ lifetimeMs: 120000, lock });
        await settle(fixture);
    }

    async function open(config: EditLockNoticeConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(HostComponent, { config });
        fixture.componentInstance.editLockService.start(LOCK_URL);
        await settle(fixture);
    }

    async function render(lock: EditLock | null, config: EditLockNoticeConfig = buildConfig()): Promise<void> {
        await open(config);
        await answer('POST', lock);
    }

    function notice(): string {
        return textsOf(queryAll(fixture, '[role="status"], [role="alert"]')).join(' ');
    }

    function buttonTexts(): string[] {
        return textsOf(queryAll(fixture, 'button'));
    }

    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'], now: NOW });
        TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [provideBeyTesting({ token: 'session-token', translations: { en: TEXTS, es: TEXTS } })]
        });

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('shows nothing while the window acquires the lock nor once it holds it', async () => {
        await open();

        expect(notice()).toBe('');

        await answer('POST', OWN);

        expect(notice()).toBe('');
    });

    it('names a colleague who has been editing since today, with nothing to release for a normal user', async () => {
        await render(COLLEAGUE);

        expect(notice()).toBe('Grace Hopper since 9:05 AM.');
        expect(buttonTexts()).toEqual([]);
    });

    it('names as unknown a colleague whose name resolves to nothing', async () => {
        await render({ ...COLLEAGUE, holderName: null });

        expect(notice()).toBe('Unknown since 9:05 AM.');
    });

    it('gives the date as well when the editing started on an earlier day, in the language in use', async () => {
        TestBed.inject(TranslateService).use('es');
        await render({ ...COLLEAGUE, acquiredAt: new Date(2026, 9, 9, 16, 30).getTime() });

        expect(notice()).toBe('Grace Hopper since 9 oct 2026 at 16:30.');
    });

    it('lets a manager or a superadmin release the lock of a colleague once confirmed', async () => {
        await render(RELEASABLE);
        TestBed.inject(FakeModalService).setConfirmationAnswer(true);

        buttonByName(fixture, 'Release').click();

        expect(TestBed.inject(FakeModalService).confirmations()).toEqual([
            {
                confirmLabel: 'demo.lock.release-confirmation.confirm',
                message: 'demo.lock.release-confirmation.message',
                messageParameters: { name: 'Grace Hopper' },
                title: 'demo.lock.release-confirmation.title'
            }
        ]);
        expect(lockRequest('DELETE').request.params.has('token')).toBe(false);
    });

    it('keeps the lock of a colleague when the release is not confirmed', async () => {
        await render(RELEASABLE);

        buttonByName(fixture, 'Release').click();

        httpTesting.expectNone((request: HttpRequest<unknown>) => request.method === 'DELETE');
    });

    it('offers the same user to edit here, taking the lock over from the other window', async () => {
        await render(OTHER_WINDOW);

        expect(notice()).toContain('In another window.');

        buttonByName(fixture, 'Edit here').click();

        expect(lockRequest('POST').request.body).toEqual({
            isTakeOver: true,
            token: fixture.componentInstance.editLockService.token
        });
    });

    it('lets the product reload before taking the lock over', async () => {
        const onEdit = jest.fn();
        await render(OTHER_WINDOW, buildConfig({ onEdit }));

        buttonByName(fixture, 'Edit here').click();

        httpTesting.expectNone((request: HttpRequest<unknown>) => request.method === 'POST');

        onEdit.mock.calls[0][0]();

        expect(lockRequest('POST').request.body).toEqual(expect.objectContaining({ isTakeOver: true }));
    });

    it('says the editing was lost and offers to save the changes as a copy', async () => {
        const onSaveCopy = jest.fn();
        await render(OWN, buildConfig({ onSaveCopy }));
        jest.advanceTimersByTime(30000);
        await answer('POST', COLLEAGUE);

        expect(notice()).toContain('Grace Hopper took it.');

        buttonByName(fixture, 'Save as a copy').click();

        expect(onSaveCopy).toHaveBeenCalledTimes(1);
    });

    it('says the editing moved to another window of the same user', async () => {
        await render(OWN);
        jest.advanceTimersByTime(30000);
        await answer('POST', OTHER_WINDOW);

        expect(notice()).toBe('Moved to another window.');
    });

    it('says the editing was released, with no copy to save while the product has no changes', async () => {
        await render(OWN);
        jest.advanceTimersByTime(30000);
        lockRequest('POST').flush({ lifetimeMs: 120000, lock: { ...OWN, acquiredAt: OWN.acquiredAt + 1 } });
        lockRequest('DELETE').flush(null, { status: 204, statusText: 'No Content' });
        await settle(fixture);

        expect(notice()).toBe('Released.');
        expect(queryButton(fixture, 'Save as a copy')).toBeNull();
    });

    it('offers to edit once the lock is free, letting the product reload before acquiring it', async () => {
        const onEdit = jest.fn();
        await render(null, buildConfig({ onEdit, onSaveCopy: jest.fn() }));

        expect(notice()).toContain('It is free.');
        expect(buttonTexts()).toEqual(['Edit', 'Save as a copy']);

        buttonByName(fixture, 'Edit').click();
        onEdit.mock.calls[0][0]();

        expect(lockRequest('POST').request.body).toEqual({ token: fixture.componentInstance.editLockService.token });
    });

    it('acquires a free lock at once when the product has nothing to reload', async () => {
        await render(null);

        buttonByName(fixture, 'Edit').click();

        expect(lockRequest('POST').request.body).toEqual({ token: fixture.componentInstance.editLockService.token });
    });

    it('says the row is no longer available, with nothing to do about it', async () => {
        await open();
        lockRequest('POST').flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        expect(notice()).toBe('Gone.');
        expect(buttonTexts()).toEqual([]);
    });

    it('speaks with the texts of the library unless the product gives a prefix', async () => {
        await render(COLLEAGUE, new EditLockNoticeConfig());

        expect(notice()).toBe('Grace Hopper has been editing it since 9:05 AM. You can look at it, but not change it.');
    });
});
