import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import {
    GroupDetail,
    GroupEditFields,
    GroupExtraRole,
    GroupMember,
    GroupMemberOptionsResponse,
    GroupRoleOptionsResponse,
    GroupRow,
    GROUPS_MEMBER_OPTIONS_PATH,
    GROUPS_ROLE_OPTIONS_PATH
} from '../models/groups.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    edit(baseUrl: string, id: string, fields: GroupEditFields, successToast: string): Observable<GroupRow> {
        return this.httpService.put<GroupRow>(this.url(baseUrl, id), fields, { successToast });
    }

    loadGroup(baseUrl: string, id: string): Observable<GroupDetail> {
        return this.httpService.get<GroupDetail>(this.url(baseUrl, id));
    }

    loadMemberOptions(baseUrl: string, id: string): Observable<GroupMember[]> {
        return this.httpService
            .get<GroupMemberOptionsResponse>(this.url(baseUrl, id, GROUPS_MEMBER_OPTIONS_PATH))
            .pipe(map(({ users }) => users));
    }

    loadRoleOptions(baseUrl: string, id: string): Observable<GroupExtraRole[]> {
        return this.httpService
            .get<GroupRoleOptionsResponse>(this.url(baseUrl, id, GROUPS_ROLE_OPTIONS_PATH))
            .pipe(map(({ extraRoles }) => extraRoles ?? []));
    }

    private url(baseUrl: string, id: string, suffix = ''): string {
        return `${this.pageUrlService.resolve(baseUrl)}/${id}${suffix}`;
    }
}
