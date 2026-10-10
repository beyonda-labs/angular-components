import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import { PasswordPolicy } from './models/password-policy.model';
import { PasswordPolicyService } from './password-policy.service';

const POLICY_URL = 'https://api.test/auth/password-policy';
const STRICT = {
    isDigitRequired: true,
    isLowercaseRequired: true,
    isSymbolRequired: true,
    isUppercaseRequired: true,
    maxLength: 64,
    minLength: 12
};

describe('PasswordPolicyService', () => {
    let httpTesting: HttpTestingController;
    let service: PasswordPolicyService;

    function setUp(interceptors: HttpInterceptorFn[] = []): void {
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ interceptors })] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PasswordPolicyService);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('from the server', () => {
        beforeEach(() => {
            setUp();
        });

        it('asks for nothing until the policy is read', () => {
            httpTesting.expectNone(POLICY_URL);
        });

        it('answers the library defaults until the policy arrives, and then the policy', () => {
            expect(service.policy()).toEqual(new PasswordPolicy());

            httpTesting.expectOne(POLICY_URL).flush(STRICT);

            expect(service.policy()).toEqual(new PasswordPolicy(STRICT));
        });

        it('asks once for every reader, while the request is on its way and after it', () => {
            service.policy();
            service.policy();
            httpTesting.expectOne(POLICY_URL).flush(STRICT);

            service.policy();
            httpTesting.expectNone(POLICY_URL);
        });

        it('keeps the library defaults when the policy cannot be read, and asks no more', () => {
            service.policy();
            httpTesting.expectOne(POLICY_URL).flush(null, { status: 500, statusText: 'Error' });

            expect(service.policy()).toEqual(new PasswordPolicy());
            httpTesting.expectNone(POLICY_URL);
        });

        it('fills in the defaults of what the policy leaves out', () => {
            service.policy();
            httpTesting.expectOne(POLICY_URL).flush({ isDigitRequired: true });

            expect(service.policy()).toEqual(
                new PasswordPolicy({ isDigitRequired: true, maxLength: 128, minLength: 8 })
            );
        });
    });

    describe('answered at once', () => {
        beforeEach(() => {
            setUp([() => of(new HttpResponse({ body: STRICT }))]);
        });

        it('takes the policy on the first read, even from another computed', () => {
            const minLength = computed(() => service.policy().minLength);

            expect(minLength()).toBe(12);
        });
    });
});
