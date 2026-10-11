import { inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { RolePermissionEntry } from '../models/roles.model';
import { RolesHttpService } from './roles-http.service';

@Injectable()
export class RolePermissionsService {
    private readonly rolesHttpService = inject(RolesHttpService);

    private readonly _permissions = signal<RolePermissionEntry[] | null>(null);

    readonly permissions = this._permissions.asReadonly();

    load(baseUrl: string): void {
        this.rolesHttpService
            .loadPermissions(baseUrl)
            .pipe(catchError(() => of([])))
            .subscribe(permissions => this._permissions.set(permissions));
    }
}
