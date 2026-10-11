import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageUrlService } from '../../page/services/page-url.service';
import {
    GroupMember,
    GroupMemberOptionsResponse,
    GroupMembersResponse,
    GROUPS_MEMBER_OPTIONS_PATH,
    GROUPS_MEMBERS_PATH
} from '../models/groups.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    loadMemberOptions(baseUrl: string, id: string): Observable<GroupMember[]> {
        return this.httpService
            .get<GroupMemberOptionsResponse>(this.url(baseUrl, id, GROUPS_MEMBER_OPTIONS_PATH))
            .pipe(map(({ users }) => users));
    }

    loadMembers(baseUrl: string, id: string): Observable<GroupMember[]> {
        return this.httpService
            .get<GroupMembersResponse>(this.url(baseUrl, id, GROUPS_MEMBERS_PATH))
            .pipe(map(({ members }) => members));
    }

    setMembers(baseUrl: string, id: string, userIds: string[], successToast: string): Observable<GroupMember[]> {
        return this.httpService
            .put<GroupMembersResponse>(this.url(baseUrl, id, GROUPS_MEMBERS_PATH), { userIds }, { successToast })
            .pipe(map(({ members }) => members));
    }

    private url(baseUrl: string, id: string, suffix: string): string {
        return `${this.pageUrlService.resolve(baseUrl)}/${id}${suffix}`;
    }
}
