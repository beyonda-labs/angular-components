import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { SessionUser } from '../../../services/session/models/session.model';
import { SessionService } from '../../../services/session/session.service';
import { PageOrganization } from '../../page/models/page-organization.model';
import { USERS_SUPERADMIN_ROLE } from '../models/users.model';
import { UsersHttpService } from './users-http.service';

@Injectable()
export class UserOrganizationsService {
    private readonly sessionService = inject(SessionService);
    private readonly usersHttpService = inject(UsersHttpService);

    private readonly _organizations = signal<PageOrganization[] | null>(null);

    readonly organizationId = computed(() => this.sessionService.user()?.organizationId);
    readonly organizations = this._organizations.asReadonly();

    load(baseUrl: string): void {
        if (!isSuperadmin(this.sessionService.getUser())) {
            this._organizations.set([]);

            return;
        }

        this.usersHttpService
            .loadOrganizations(baseUrl)
            .pipe(catchError(() => of([])))
            .subscribe(organizations => this._organizations.set(organizations));
    }
}

function isSuperadmin(user: SessionUser | null): boolean {
    return user?.roles?.includes(USERS_SUPERADMIN_ROLE) ?? false;
}
