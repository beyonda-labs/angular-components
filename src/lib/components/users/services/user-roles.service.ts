import { inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { UsersHttpService } from './users-http.service';

@Injectable()
export class UserRolesService {
    private readonly usersHttpService = inject(UsersHttpService);

    private readonly _roles = signal<string[] | null>(null);

    readonly roles = this._roles.asReadonly();

    load(baseUrl: string): void {
        this.usersHttpService
            .loadRoles(baseUrl)
            .pipe(catchError(() => of([])))
            .subscribe(roles => this._roles.set(roles));
    }
}
