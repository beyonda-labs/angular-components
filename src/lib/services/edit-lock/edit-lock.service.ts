import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, NgZone, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Observable, Subscription } from 'rxjs';

import { EditLockHttpService } from './edit-lock-http.service';
import { nextEditLockState } from './functions/edit-lock-state';
import {
    DEFAULT_EDIT_LOCK_LIFETIME_MS,
    EDIT_LOCK_TOKEN_HEADER,
    EditLockResponse,
    EditLockState
} from './models/edit-lock.model';

const CONFLICT_STATUS = 409;
const FORBIDDEN_STATUS = 403;
const HEARTBEATS_PER_LIFETIME = 4;
const NOT_FOUND_STATUS = 404;
const TOKEN_BYTES = 16;

@Injectable()
export class EditLockService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly document = inject(DOCUMENT);
    private readonly editLockHttpService = inject(EditLockHttpService);
    private readonly ngZone = inject(NgZone);

    private readonly _state = signal<EditLockState>({ lock: null, status: 'acquiring' });
    private lifetimeMs = DEFAULT_EDIT_LOCK_LIFETIME_MS;
    private request?: Subscription;
    private timer?: ReturnType<typeof setInterval>;
    private url?: string;

    readonly state = this._state.asReadonly();
    readonly token = createToken();

    constructor() {
        const view = this.document.defaultView;

        if (view) {
            fromEvent(view, 'pagehide')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.leavePage());
        }

        this.destroyRef.onDestroy(() => this.leave());
    }

    acquire(): void {
        this.claim(false);
    }

    headers(): Record<string, string> {
        return { [EDIT_LOCK_TOKEN_HEADER]: this.token };
    }

    release(): void {
        if (!this.url || !isHolding(this._state())) {
            return;
        }

        this.request?.unsubscribe();
        this.releaseQuietly(this.url);
        this._state.set({ lock: null, status: 'free' });
    }

    releaseOther(): void {
        if (!this.url || this._state().status === 'unavailable') {
            return;
        }

        this.track(
            this.editLockHttpService.releaseOther(this.url),
            () => this._state.set({ lock: null, status: 'free' }),
            [NOT_FOUND_STATUS]
        );
    }

    start(lockUrl: string): void {
        if (lockUrl === this.url) {
            return;
        }

        this.leave();
        this.url = lockUrl;
        this._state.set({ lock: null, status: 'acquiring' });
        this.post(false);
        this.schedule();
    }

    takeOver(): void {
        this.claim(true);
    }

    private apply({ lifetimeMs, lock }: EditLockResponse): void {
        const current = this._state();
        const next = nextEditLockState(current, lock);

        this._state.set(next);

        if (next.status === 'lost' && lock?.isOwn && this.url) {
            this.releaseQuietly(this.url);
        }

        if (lifetimeMs > 0 && lifetimeMs !== this.lifetimeMs) {
            this.lifetimeMs = lifetimeMs;
            this.schedule();
        }
    }

    private claim(isTakeOver: boolean): void {
        const current = this._state();

        if (!this.url || current.status === 'unavailable') {
            return;
        }

        if (current.status !== 'own') {
            this._state.set({ ...current, status: 'acquiring' });
        }

        this.post(isTakeOver);

        if (!this.timer) {
            this.schedule();
        }
    }

    private find(url: string): void {
        this.track(this.editLockHttpService.find(url, this.token), response => this.apply(response), [
            NOT_FOUND_STATUS
        ]);
    }

    private leave(): void {
        const { url } = this;

        this.stop();

        if (url && isHolding(this._state())) {
            this.releaseQuietly(url);
        }
    }

    private leavePage(): void {
        this.stop();

        if (this.url && isHolding(this._state())) {
            this.editLockHttpService.releaseOnLeave(this.url, this.token);
            this._state.set({ lock: null, status: 'free' });
        }
    }

    private post(isTakeOver: boolean): void {
        if (!this.url) {
            return;
        }

        this.track(
            this.editLockHttpService.acquire(this.url, this.token, isTakeOver),
            response => this.apply(response),
            [CONFLICT_STATUS, FORBIDDEN_STATUS, NOT_FOUND_STATUS]
        );
    }

    private releaseQuietly(url: string): void {
        this.editLockHttpService.release(url, this.token).subscribe({ error: ignoreError });
    }

    private schedule(): void {
        clearInterval(this.timer);

        const period = this.lifetimeMs / HEARTBEATS_PER_LIFETIME;

        this.timer = this.ngZone.runOutsideAngular(() => setInterval(() => this.ngZone.run(() => this.tick()), period));
    }

    private stop(): void {
        clearInterval(this.timer);
        this.timer = undefined;
        this.request?.unsubscribe();
    }

    private tick(): void {
        if (!this.url || (this.request && !this.request.closed)) {
            return;
        }

        if (isHolding(this._state())) {
            this.post(false);
        } else {
            this.find(this.url);
        }
    }

    private track<T>(request$: Observable<T>, onAnswer: (answer: T) => void, unavailableStatuses: number[]): void {
        this.request?.unsubscribe();
        this.request = request$.subscribe({
            error: (error: HttpErrorResponse) => {
                if (unavailableStatuses.includes(error.status)) {
                    this.stop();
                    this._state.set({ lock: null, status: 'unavailable' });
                }
            },
            next: onAnswer
        });
    }
}

function createToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)), byte =>
        byte.toString(16).padStart(2, '0')
    ).join('');
}

function ignoreError(): void {}

function isHolding({ status }: EditLockState): boolean {
    return status === 'acquiring' || status === 'own';
}
