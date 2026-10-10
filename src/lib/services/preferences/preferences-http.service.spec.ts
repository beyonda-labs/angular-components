import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG } from './models/preferences.model';
import { PreferencesHttpService } from './preferences-http.service';

describe('PreferencesHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: PreferencesHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PREFERENCES_CONFIG, useValue: { ...DEFAULT_PREFERENCES_CONFIG, accountUrl: '/me' } }
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PreferencesHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('puts the preferences it is given to the account of the api', () => {
        service.save({ theme: 'dark' }).subscribe();
        const request = httpTesting.expectOne('https://api.test/api/me');

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ theme: 'dark' });
    });

    it('fails without opening the error modal', () => {
        const error = jest.fn();

        service.save({ language: 'es' }).subscribe({ error });
        httpTesting.expectOne('https://api.test/api/me').flush(null, { status: 400, statusText: 'Bad Request' });

        expect(error).toHaveBeenCalled();
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });
});
