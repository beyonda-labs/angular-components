import { inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { UserRoles } from '../models/users.model';
import { UsersHttpService } from './users-http.service';

const NO_ROLES: UserRoles = { extraRoles: [], roles: [] };

@Injectable()
export class UserRolesService {
    private readonly usersHttpService = inject(UsersHttpService);

    private readonly _roles = signal<UserRoles | null>(null);

    readonly roles = this._roles.asReadonly();

    load(baseUrl: string): void {
        this.usersHttpService
            .loadRoles(baseUrl)
            .pipe(catchError(() => of(NO_ROLES)))
            .subscribe(roles => this._roles.set(roles));
    }
}
