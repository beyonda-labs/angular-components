import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { PasswordPolicyParameters } from './models/password-policy.model';
import { PasswordPolicyHttpService } from './password-policy-http.service';

const POLICY_URL = 'https://api.test/auth/password-policy';

describe('PasswordPolicyHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: PasswordPolicyHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PasswordPolicyHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the policy from the access control api', () => {
        const policy: PasswordPolicyParameters = { isDigitRequired: true, maxLength: 128, minLength: 10 };
        const next = jest.fn();

        service.load().subscribe(next);
        const request = httpTesting.expectOne(POLICY_URL);
        request.flush(policy);

        expect(request.request.method).toBe('GET');
        expect(next).toHaveBeenCalledWith(policy);
    });

    it('ends without a policy and without the error modal when the request fails', () => {
        const next = jest.fn();
        const complete = jest.fn();

        service.load().subscribe({ complete, next });
        httpTesting.expectOne(POLICY_URL).flush(null, { status: 503, statusText: 'Service Unavailable' });

        expect(next).not.toHaveBeenCalled();
        expect(complete).toHaveBeenCalled();
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });
});
