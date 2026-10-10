import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, map, Observable, of, shareReplay } from 'rxjs';

import { SESSION_CONFIG, SessionUser } from './models/session.model';
import { SessionHttpService } from './session-http.service';
import { StorageService } from './storage.service';

const LEGACY_STORAGE_KEYS = ['bey_refresh_token', 'bey_token', 'bey_user'];

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private readonly config = inject(SESSION_CONFIG);
    private readonly router = inject(Router);
    private readonly sessionHttpService = inject(SessionHttpService);
    private readonly storageService = inject(StorageService);

    private readonly _isRestoreRefused = signal(false);
    private readonly _token = signal<string | null>(null);
    private readonly _user = signal<SessionUser | null>(null);
    private restoring$?: Observable<boolean>;

    readonly isAuthenticated = computed(() => this._token() !== null);
    readonly token = this._token.asReadonly();
    readonly user = this._user.asReadonly();

    constructor() {
        LEGACY_STORAGE_KEYS.forEach(key => this.storageService.remove(key));
    }

    clear(): void {
        this._isRestoreRefused.set(true);
        this._token.set(null);
        this._user.set(null);
    }

    getToken(): string | null {
        return this._token();
    }

    getUser(): SessionUser | null {
        return this._user();
    }

    logout(): void {
        this.sessionHttpService
            .logout()
            .pipe(catchError(() => EMPTY))
            .subscribe({ complete: () => this.leave() });
    }

    restore(): Observable<boolean> {
        if (this._isRestoreRefused()) {
            return of(false);
        }

        this.restoring$ ??= this.sessionHttpService.refresh().pipe(
            map(({ accessToken }) => {
                this.setToken(accessToken);

                return true;
            }),
            catchError(() => {
                this._isRestoreRefused.set(true);

                return of(false);
            }),
            finalize(() => {
                this.restoring$ = undefined;
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        return this.restoring$;
    }

    setToken(token: string): void {
        this._isRestoreRefused.set(false);
        this._token.set(token);

        const user = decodeJwtUser(token);

        if (user) {
            this._user.set(user);
        }
    }

    setUser(user: SessionUser): void {
        this._user.set(user);
    }

    private leave(): void {
        this.clear();
        this.router.navigate([this.config.loginRoute]);
    }
}

function decodeJwtUser(token: string): SessionUser | null {
    try {
        const base64 = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
        const allowedPaths = (payload['allowedPaths'] as string[] | undefined) ?? [];

        return {
            email: payload['email'] as string,
            allowedPaths,
            redirectPath: allowedPaths[0] ?? '',
            roles: (payload['roles'] as string[] | undefined) ?? [],
            organizationId: payload['organizationId'] as string | undefined,
            name: payload['name'] as string | undefined,
            surname: payload['surname'] as string | undefined,
            language: payload['language'] as string | undefined,
            theme: payload['theme'] as string | undefined
        };
    } catch {
        return null;
    }
}
