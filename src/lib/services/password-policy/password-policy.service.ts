import { computed, inject, Injectable, signal, untracked } from '@angular/core';

import { PasswordPolicy } from './models/password-policy.model';
import { PasswordPolicyHttpService } from './password-policy-http.service';

@Injectable({
    providedIn: 'root'
})
export class PasswordPolicyService {
    private readonly passwordPolicyHttpService = inject(PasswordPolicyHttpService);

    private readonly _policy = signal(new PasswordPolicy());
    private isRequested = false;

    readonly policy = computed(() => {
        untracked(() => this.request());

        return this._policy();
    });

    private request(): void {
        if (this.isRequested) {
            return;
        }

        this.isRequested = true;
        this.passwordPolicyHttpService.load().subscribe(parameters => this._policy.set(new PasswordPolicy(parameters)));
    }
}
