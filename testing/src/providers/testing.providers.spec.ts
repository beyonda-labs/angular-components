import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import {
    BEY_ENVIRONMENT_CONFIG,
    BeyFilePreviewService,
    BeyHttpService,
    BeyModalFormService,
    BeyModalService,
    BeyModalTreeConfig,
    BeyModalTreeService,
    BeySessionService,
    BeySessionUser,
    BeyStorageService,
    BeyToastService,
    BeyUnsavedChangesService
} from '@beyonda-labs/angular-components';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';

import { hostOf, renderComponent } from '../dom';
import { TestingConfig } from '../models/testing.model';
import { FakeFilePreviewService } from '../services/fake-file-preview.service';
import { FakeModalService } from '../services/fake-modal.service';
import { FakeModalFormService } from '../services/fake-modal-form.service';
import { FakeStorageService } from '../services/fake-storage.service';
import { FakeToastService } from '../services/fake-toast.service';
import { provideBeyTesting } from './testing.providers';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe],
    selector: 'bey-testing-probe',
    template: "<p>{{ 'greeting' | translate }}</p>"
})
class TranslationProbeComponent {}

describe('provideBeyTesting', () => {
    const user: BeySessionUser = {
        allowedPaths: ['/templates'],
        email: 'ada@example.test',
        redirectPath: '/templates'
    };

    function setup(config?: TestingConfig): void {
        TestBed.configureTestingModule({ providers: [provideBeyTesting(config)] });
    }

    async function renderedGreeting(): Promise<string | undefined> {
        const fixture = await renderComponent(TranslationProbeComponent);

        return hostOf(fixture).textContent?.trim();
    }

    beforeEach(() => {
        localStorage.clear();
    });

    it('hands each fake to whoever injects the real service', () => {
        setup();

        expect(TestBed.inject(BeyFilePreviewService)).toBe(TestBed.inject(FakeFilePreviewService));
        expect(TestBed.inject(BeyModalFormService)).toBe(TestBed.inject(FakeModalFormService));
        expect(TestBed.inject(BeyModalService)).toBe(TestBed.inject(FakeModalService));
        expect(TestBed.inject(BeyStorageService)).toBe(TestBed.inject(FakeStorageService));
        expect(TestBed.inject(BeyToastService)).toBe(TestBed.inject(FakeToastService));
    });

    it('opens the dialogs of the library services it does not fake, such as the tree dialog', () => {
        setup();

        const modalReference = TestBed.inject(BeyModalTreeService).open(
            new BeyModalTreeConfig({ nodes: [], prefix: 'demo.tree' })
        );

        expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('demo.tree.title');

        modalReference.hide();
    });

    it('answers a confirmation a library service asks for with the answer the spec sets', async () => {
        setup();
        const unsavedChanges = TestBed.inject(BeyUnsavedChangesService);

        TestBed.runInInjectionContext(() => unsavedChanges.track(signal(true)));
        TestBed.inject(FakeModalService).setConfirmationAnswer(true);

        await expect(firstValueFrom(unsavedChanges.canDeactivate() as Observable<boolean>)).resolves.toBe(true);
        expect(TestBed.inject(FakeModalService).confirmations()).toHaveLength(1);
    });

    it('lets the spec flush requests, and records the toast a library service shows on success', () => {
        setup();
        const httpTesting = TestBed.inject(HttpTestingController);

        TestBed.inject(BeyHttpService).get('https://api.test/api/items', { successToast: 'items.loaded' }).subscribe();
        httpTesting.expectOne('https://api.test/api/items').flush([]);

        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'items.loaded' }]);
        httpTesting.verify();
    });

    it('raises nothing for a failed request whose error modal is already open', fakeAsync(() => {
        setup();

        TestBed.inject(BeyHttpService).get('https://api.test/api/items').subscribe();
        TestBed.inject(HttpTestingController)
            .expectOne('https://api.test/api/items')
            .flush(null, { status: 500, statusText: 'Server Error' });

        expect(() => flush()).not.toThrow();
        expect(TestBed.inject(FakeModalService).errors()).toHaveLength(1);
    }));

    it('sends each request with the session token, through the extra interceptors after it', () => {
        const seenAuthorization: (null | string)[] = [];
        const tagInterceptor: HttpInterceptorFn = (request, next) => {
            seenAuthorization.push(request.headers.get('Authorization'));

            return next(request);
        };

        setup({ interceptors: [tagInterceptor], token: 'session-token' });
        TestBed.inject(HttpClient).get('/api/items').subscribe();
        TestBed.inject(HttpTestingController).expectOne('/api/items').flush([]);

        expect(seenAuthorization).toEqual(['Bearer session-token']);
    });

    it('provides a test environment, with the fields the spec overrides', () => {
        setup({ environment: { webApiPath: '/v2' } });

        expect(TestBed.inject(BEY_ENVIRONMENT_CONFIG)).toEqual({
            accessControlUrl: 'https://api.test/auth',
            appName: 'test-app',
            baseUrl: 'https://api.test',
            cookieName: 'test-session',
            webApiPath: '/v2'
        });
    });

    it('starts with nobody signed in', () => {
        setup();
        const session = TestBed.inject(BeySessionService);

        expect(session.isAuthenticated()).toBe(false);
        expect(session.user()).toBeNull();
    });

    it('signs in the user it is given, without writing to localStorage', () => {
        setup({ user });
        const session = TestBed.inject(BeySessionService);

        expect(session.isAuthenticated()).toBe(true);
        expect(session.user()).toEqual(user);
        expect(localStorage.length).toBe(0);
    });

    it('renders translation keys as they are by default', async () => {
        setup();

        await expect(renderedGreeting()).resolves.toBe('greeting');
    });

    it('renders the texts it is given for the language in use', async () => {
        setup({ language: 'es', translations: { en: { greeting: 'Hello' }, es: { greeting: 'Hola' } } });

        await expect(renderedGreeting()).resolves.toBe('Hola');
    });

    it('uses English unless told otherwise', async () => {
        setup({ translations: { en: { greeting: 'Hello' }, es: { greeting: 'Hola' } } });

        await expect(renderedGreeting()).resolves.toBe('Hello');
    });
});
