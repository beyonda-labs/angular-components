import { inject, Injectable } from '@angular/core';
import { forkJoin, tap } from 'rxjs';

import { PageHandle } from '../../../page/models/page.model';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { UserRow, UsersConfig } from '../models/users.model';
import { UserContentFormService } from './user-content-form.service';
import { UsersHttpService } from './users-http.service';

@Injectable({
    providedIn: 'root'
})
export class UsersActionsService {
    private readonly userContentFormService = inject(UserContentFormService);
    private readonly usersHttpService = inject(UsersHttpService);

    delete(
        { baseUrl, contentLabels, prefix }: UsersConfig,
        users: UserRow[],
        page?: PageHandle<UserRow, OrganizationFolder>
    ): void {
        if (!page || users.length === 0) {
            return;
        }

        forkJoin(users.map(({ id }) => this.usersHttpService.loadContent(baseUrl, id))).subscribe(contents =>
            page.openForm(
                this.userContentFormService.buildDeleteConfig({ contentLabels, contents, prefix, users }),
                () =>
                    this.usersHttpService
                        .deleteUsers(
                            baseUrl,
                            users.map(({ id }) => id),
                            `${prefix}.toast.delete-success`
                        )
                        .pipe(tap({ error: () => page.refresh() }))
            )
        );
    }

    resendInvitation({ baseUrl, prefix }: UsersConfig, user: UserRow): void {
        this.usersHttpService
            .resendInvitation(baseUrl, user.id, `${prefix}.toast.resend-invitation-success`)
            .subscribe();
    }

    transfer(
        { baseUrl, contentLabels, prefix }: UsersConfig,
        user: UserRow,
        page?: PageHandle<UserRow, OrganizationFolder>
    ): void {
        if (!page) {
            return;
        }

        this.usersHttpService.loadContent(baseUrl, user.id).subscribe(content =>
            page.openForm(
                this.userContentFormService.buildTransferConfig({
                    content,
                    contentLabels,
                    prefix,
                    searchTargets: (search, limit) =>
                        this.usersHttpService.searchTransferTargets(baseUrl, user.id, search, limit),
                    user
                }),
                ({ main }) =>
                    this.usersHttpService.transfer(
                        baseUrl,
                        user.id,
                        main.targetUserId,
                        `${prefix}.toast.transfer-success`
                    )
            )
        );
    }
}
