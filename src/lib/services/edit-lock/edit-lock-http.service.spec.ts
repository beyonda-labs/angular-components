import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { HttpService } from '../http/http.service';
import editLockEn from './assets/edit-lock.en.json';
import { EditLockHttpService } from './edit-lock-http.service';

describe('EditLockHttpService', () => {
    const originalFetch = globalThis.fetch;
    let fetchSpy: jest.Mock;
    let httpTesting: HttpTestingController;

    function setup(token?: string): EditLockHttpService {
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ token })] });
        httpTesting = TestBed.inject(HttpTestingController);

        return TestBed.inject(EditLockHttpService);
    }

    beforeEach(() => {
        fetchSpy = jest.fn().mockResolvedValue(undefined);
        globalThis.fetch = fetchSpy;
    });

    afterEach(() => {
        httpTesting.verify();
        globalThis.fetch = originalFetch;
    });

    it('releases on leaving with a path of the app, without a bearer while nobody is signed in', () => {
        setup().releaseOnLeave('/api/templates/t1/lock?mode=edit', 'window-1');

        expect(fetchSpy).toHaveBeenCalledWith('http://localhost/api/templates/t1/lock?mode=edit&token=window-1', {
            headers: {},
            keepalive: true,
            method: 'DELETE'
        });
    });

    it.each([
        ['edit-locks.held', 'Being edited', 'Grace Hopper is editing it: your changes were not saved.'],
        [
            'edit-locks.released',
            'Editing released',
            'Your editing was released, so your changes were not saved here. Save them as a copy, or reload it to edit ' +
                'it again.'
        ]
    ])('ships the texts of a save the lock refuses with %s', (messageKey, title, message) => {
        setup();
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', editLockEn);

        TestBed.inject(HttpService)
            .put('https://api.test/api/template-definitions/d1', {})
            .subscribe({ error: () => {} });
        httpTesting
            .expectOne('https://api.test/api/template-definitions/d1')
            .flush(
                { errorCode: 'conflict', messageKey, messageParameters: { holderName: 'Grace Hopper' } },
                { status: 409, statusText: 'Conflict' }
            );
        const [error] = TestBed.inject(FakeModalService).errors();

        expect([translate.instant(error.title), translate.instant(error.message, error.messageParameters)]).toEqual([
            title,
            message
        ]);
    });
});
