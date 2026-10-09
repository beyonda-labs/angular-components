import { inject, Injectable } from '@angular/core';

import { UserRow, UsersConfig } from '../models/users.model';
import { UsersHttpService } from './users-http.service';

@Injectable({
    providedIn: 'root'
})
export class UsersActionsService {
    private readonly usersHttpService = inject(UsersHttpService);

    resendInvitation({ baseUrl, prefix }: UsersConfig, user: UserRow): void {
        this.usersHttpService
            .resendInvitation(baseUrl, user.id, `${prefix}.toast.resend-invitation-success`)
            .subscribe();
    }
}
