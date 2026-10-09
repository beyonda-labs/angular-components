import { inject, Injectable, signal } from '@angular/core';

import { SessionService } from '../../../services/session/session.service';
import { FormHandle } from '../../form/models/form.model';
import {
    AccountConfig,
    AccountPasswordFormValue,
    AccountPasswordUpdate,
    AccountProfile,
    AccountProfileUpdate
} from '../models/account.model';
import { AccountHttpService } from './account-http.service';

@Injectable()
export class AccountService {
    private readonly accountHttpService = inject(AccountHttpService);
    private readonly sessionService = inject(SessionService);

    private readonly _profile = signal<AccountProfile | null>(null);

    readonly profile = this._profile.asReadonly();

    changePassword(
        { baseUrl, prefix }: AccountConfig,
        value: AccountPasswordUpdate,
        handle: FormHandle<AccountPasswordFormValue>
    ): void {
        this.accountHttpService
            .changePassword(baseUrl, value, `${prefix}.toast.password-success`)
            .subscribe(({ accessToken }) => {
                this.sessionService.setToken(accessToken);
                handle.reset();
            });
    }

    load({ baseUrl }: AccountConfig): void {
        this.accountHttpService.load(baseUrl).subscribe(profile => this._profile.set(profile));
    }

    saveProfile({ baseUrl, prefix }: AccountConfig, value: AccountProfileUpdate): void {
        this.accountHttpService.updateProfile(baseUrl, value, `${prefix}.toast.profile-success`).subscribe(profile => {
            this._profile.set(profile);
            this.keepOnSession(profile);
        });
    }

    private keepOnSession({ name, surname }: AccountProfile): void {
        const user = this.sessionService.getUser();

        if (user) {
            this.sessionService.setUser({ ...user, name, surname });
        }
    }
}
