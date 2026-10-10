import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { FormHandle } from '../../components/form/models/form.model';
import { SessionService } from '../session/session.service';
import { AccountHttpService } from './account-http.service';
import { AccountPasswordUpdate, AccountProfile, AccountProfileUpdate } from './models/account.model';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private readonly accountHttpService = inject(AccountHttpService);
    private readonly sessionService = inject(SessionService);

    private readonly _profile = signal<AccountProfile | null>(null);
    private loadingUrl: string | null = null;

    readonly profile = this._profile.asReadonly();

    changePassword(
        baseUrl: string,
        value: AccountPasswordUpdate,
        successToast: string,
        form: Pick<FormHandle<unknown>, 'reset'>
    ): void {
        this.accountHttpService.changePassword(baseUrl, value, { successToast }).subscribe(({ accessToken }) => {
            this.sessionService.setToken(accessToken);
            form.reset();
        });
    }

    load(baseUrl: string): void {
        if (this.loadingUrl === baseUrl) {
            return;
        }

        this.loadingUrl = baseUrl;
        this._profile.set(null);
        this.accountHttpService
            .load(baseUrl)
            .pipe(finalize(() => this.endLoading(baseUrl)))
            .subscribe(profile => this._profile.set(profile));
    }

    saveProfile(baseUrl: string, value: AccountProfileUpdate, successToast: string): void {
        this.accountHttpService.updateProfile(baseUrl, value, { successToast }).subscribe(profile => {
            this._profile.set(profile);
            this.keepOnSession(profile);
        });
    }

    private endLoading(baseUrl: string): void {
        if (this.loadingUrl === baseUrl) {
            this.loadingUrl = null;
        }
    }

    private keepOnSession({ name, surname }: AccountProfile): void {
        const user = this.sessionService.getUser();

        if (user) {
            this.sessionService.setUser({ ...user, name, surname });
        }
    }
}
