import { HttpErrorResponse } from '@angular/common/http';

import { CustomErrorResponse } from '../../../services/http/models/http.model';

const EMAIL_NOT_VERIFIED_KEY = 'login.email-not-verified';
const TOKEN_INVALID_KEY = 'account.token-invalid';

export function isTokenInvalid(error: unknown): boolean {
    return errorBodyOf(error)?.messageKey === TOKEN_INVALID_KEY;
}

export function unverifiedEmailOf(error: unknown, typedEmail: string): string | null {
    const body = errorBodyOf(error);

    if (body?.messageKey !== EMAIL_NOT_VERIFIED_KEY) {
        return null;
    }

    const email = body.messageParameters?.['email'];

    return typeof email === 'string' && email ? email : typedEmail;
}

function errorBodyOf(error: unknown): CustomErrorResponse | null {
    if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
        return null;
    }

    return error.error as CustomErrorResponse;
}
