import { HttpErrorResponse } from '@angular/common/http';

import { isTokenInvalid, unverifiedEmailOf } from './login-error';

function buildError(body: unknown, status = 400): HttpErrorResponse {
    return new HttpErrorResponse({ error: body, status });
}

describe('login-error', () => {
    it('recognises a refused emailed token', () => {
        expect(isTokenInvalid(buildError({ errorCode: 'bad-request', messageKey: 'account.token-invalid' }))).toBe(
            true
        );
        expect(isTokenInvalid(buildError({ errorCode: 'bad-request', messageKey: 'login.passwords-not-match' }))).toBe(
            false
        );
        expect(isTokenInvalid(buildError(null, 0))).toBe(false);
        expect(isTokenInvalid(new Error('account.token-invalid'))).toBe(false);
    });

    it('reads the unverified email from the sign-in refusal, or falls back to the typed one', () => {
        const refusal = { errorCode: 'forbidden', messageKey: 'login.email-not-verified' };

        expect(
            unverifiedEmailOf(buildError({ ...refusal, messageParameters: { email: 'ada@example.com' } }, 403), 'typed')
        ).toBe('ada@example.com');
        expect(unverifiedEmailOf(buildError(refusal, 403), 'typed@example.com')).toBe('typed@example.com');
        expect(
            unverifiedEmailOf(buildError({ errorCode: 'forbidden', messageKey: 'login.account-inactive' }, 403), 'x')
        ).toBeNull();
    });
});
