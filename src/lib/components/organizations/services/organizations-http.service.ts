import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageUrlService } from '../../page/services/page-url.service';
import { OrganizationAdminInvitation } from '../models/organizations.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    inviteAdmin(usersUrl: string, invitation: OrganizationAdminInvitation, successToast: string): Observable<unknown> {
        return this.httpService.post(this.pageUrlService.resolve(usersUrl), invitation, { successToast });
    }
}
