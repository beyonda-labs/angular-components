import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../http/http.service';
import { SessionService } from '../session/session.service';
import { EDIT_LOCK_TOKEN_PARAMETER, EditLockResponse } from './models/edit-lock.model';

@Injectable({
    providedIn: 'root'
})
export class EditLockHttpService {
    private readonly document = inject(DOCUMENT);
    private readonly httpService = inject(HttpService);
    private readonly sessionService = inject(SessionService);

    acquire(url: string, token: string, isTakeOver: boolean): Observable<EditLockResponse> {
        return this.httpService.post<EditLockResponse>(url, isTakeOver ? { isTakeOver: true, token } : { token }, {
            handleError: ignoreError
        });
    }

    find(url: string, token: string): Observable<EditLockResponse> {
        return this.httpService.get<EditLockResponse>(url, {
            handleError: ignoreError,
            queryParams: { [EDIT_LOCK_TOKEN_PARAMETER]: token }
        });
    }

    release(url: string, token: string): Observable<void> {
        return this.httpService.delete<void>(url, undefined, {
            handleError: ignoreError,
            queryParams: { [EDIT_LOCK_TOKEN_PARAMETER]: token }
        });
    }

    releaseOnLeave(url: string, token: string): void {
        const accessToken = this.sessionService.getToken();
        const target = new URL(url, this.document.baseURI);

        target.searchParams.set(EDIT_LOCK_TOKEN_PARAMETER, token);
        fetch(target.href, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            keepalive: true,
            method: 'DELETE'
        }).catch(ignoreError);
    }

    releaseOther(url: string): Observable<void> {
        return this.httpService.delete<void>(url, undefined);
    }
}

function ignoreError(): void {}
