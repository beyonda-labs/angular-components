import { inject, Injectable } from '@angular/core';
import { concat, last, map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import {
    UserContent,
    UserContentResponse,
    UserRoles,
    UserRolesResponse,
    USERS_CONTENT_PATH,
    USERS_INVITATION_PATH,
    USERS_ROLES_PATH,
    USERS_TRANSFER_PATH,
    USERS_TRANSFER_TARGETS_PATH,
    UserTransferResponse,
    UserTransferTarget,
    UserTransferTargetsResponse
} from '../models/users.model';

@Injectable({
    providedIn: 'root'
})
export class UsersHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    deleteUsers(baseUrl: string, ids: string[], successToast: string): Observable<void> {
        return concat(
            ...ids.map((id, index) =>
                this.httpService.delete<void>(
                    this.url(baseUrl, id),
                    null,
                    index === ids.length - 1 ? { successToast } : undefined
                )
            )
        ).pipe(last());
    }

    loadContent(baseUrl: string, id: string): Observable<UserContent> {
        return this.httpService
            .get<UserContentResponse>(this.url(baseUrl, id, USERS_CONTENT_PATH))
            .pipe(map(({ counts = {}, usedByOthers = {} }) => ({ counts, usedByOthers })));
    }

    loadRoles(baseUrl: string): Observable<UserRoles> {
        return this.httpService
            .get<UserRolesResponse>(`${this.pageUrlService.resolve(baseUrl)}${USERS_ROLES_PATH}`)
            .pipe(map(({ extraRoles = [], roles }) => ({ extraRoles, roles })));
    }

    resendInvitation(baseUrl: string, id: string, successToast: string): Observable<void> {
        return this.httpService.post<void>(this.url(baseUrl, id, USERS_INVITATION_PATH), null, { successToast });
    }

    searchTransferTargets(
        baseUrl: string,
        id: string,
        search: string,
        limit: number
    ): Observable<UserTransferTarget[]> {
        return this.httpService
            .get<UserTransferTargetsResponse>(this.url(baseUrl, id, USERS_TRANSFER_TARGETS_PATH), {
                queryParams: { limit, search }
            })
            .pipe(map(({ options }) => options ?? []));
    }

    transfer(
        baseUrl: string,
        id: string,
        targetUserId: string,
        successToast: string
    ): Observable<UserTransferResponse> {
        return this.httpService.post<UserTransferResponse>(
            this.url(baseUrl, id, USERS_TRANSFER_PATH),
            { targetUserId },
            { successToast }
        );
    }

    private url(baseUrl: string, id: string, suffix = ''): string {
        return `${this.pageUrlService.resolve(baseUrl)}/${id}${suffix}`;
    }
}
