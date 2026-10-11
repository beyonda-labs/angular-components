import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { SessionUser } from '../../../services/session/models/session.model';
import { SessionService } from '../../../services/session/session.service';
import { PageOrganization } from '../../page/models/page-organization.model';
import { USERS_SUPERADMIN_ROLE } from '../models/user-organizations.model';
import { UserOrganizationsHttpService } from './user-organizations-http.service';

@Injectable()
export class UserOrganizationsService {
    private readonly sessionService = inject(SessionService);
    private readonly userOrganizationsHttpService = inject(UserOrganizationsHttpService);

    private readonly _organizations = signal<PageOrganization[] | null>(null);

    readonly isSuperadmin = computed(() => isSuperadmin(this.sessionService.user()));
    readonly organizations = this._organizations.asReadonly();

    load(baseUrl: string): void {
        if (!isSuperadmin(this.sessionService.getUser())) {
            this._organizations.set([]);

            return;
        }

        this.userOrganizationsHttpService
            .loadOrganizations(baseUrl)
            .pipe(catchError(() => of([])))
            .subscribe(organizations => this._organizations.set(organizations));
    }
}

function isSuperadmin(user: SessionUser | null): boolean {
    return user?.roles?.includes(USERS_SUPERADMIN_ROLE) ?? false;
}
