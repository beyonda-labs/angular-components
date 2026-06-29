import { computed, inject, Injectable, signal } from '@angular/core';

import { SESSION_CONFIG, SessionUser } from './models/session.model';
import { StorageService } from './storage.service';

function decodeJwtUser(token: string): SessionUser | null {
    try {
        const base64 = token.split('.')[1].replace(/-/gu, '+').replace(/_/gu, '/');
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
        const allowedPaths = (payload['allowedPaths'] as string[] | undefined) ?? [];

        return {
            email: payload['email'] as string,
            allowedPaths,
            redirectPath: allowedPaths[0] ?? '',
            roles: (payload['roles'] as string[] | undefined) ?? [],
            name: payload['name'] as string | undefined,
            surname: payload['surname'] as string | undefined
        };
    } catch {
        return null;
    }
}

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private readonly config = inject(SESSION_CONFIG);
    private readonly storageService = inject(StorageService);

    private readonly _token = signal<string | null>(this.storageService.get<string>(this.config.tokenKey));
    private readonly _user = signal<SessionUser | null>(this.storageService.get<SessionUser>(this.config.userKey));

    // eslint-disable-next-line unicorn/consistent-function-scoping
    readonly isAuthenticated = computed(() => this._token() !== null);
    readonly token = this._token.asReadonly();
    readonly user = this._user.asReadonly();

    clear(): void {
        this.storageService.remove(this.config.tokenKey);
        this.storageService.remove(this.config.refreshTokenKey);
        this.storageService.remove(this.config.userKey);

        this._token.set(null);
        this._user.set(null);
    }

    getRefreshToken(): string | null {
        return this.storageService.get<string>(this.config.refreshTokenKey);
    }

    getToken(): string | null {
        return this._token();
    }

    getUser(): SessionUser | null {
        return this._user();
    }

    setRefreshToken(token: string): void {
        this.storageService.set(this.config.refreshTokenKey, token);
    }

    setToken(token: string): void {
        this.storageService.set(this.config.tokenKey, token);
        this._token.set(token);

        const user = decodeJwtUser(token);
        if (user) { this.setUser(user); }
    }

    setUser(user: SessionUser): void {
        this.storageService.set(this.config.userKey, user);
        this._user.set(user);
    }
}
