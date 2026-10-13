import { effect, inject, Injectable, NgZone, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';

import { SessionService } from '../../../services/session/session.service';
import {
    Notification,
    NOTIFICATIONS_NAVIGATION_DEBOUNCE_MS,
    NotificationsConfig,
    NotificationsPage
} from '../models/notifications.model';
import { NotificationsHttpService } from './notifications-http.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    private readonly ngZone = inject(NgZone);
    private readonly notificationsHttpService = inject(NotificationsHttpService);
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    private readonly _config = signal<NotificationsConfig | null>(null);
    private readonly _hasMore = signal(false);
    private readonly _isLoading = signal(false);
    private readonly _notifications = signal<Notification[]>([]);
    private readonly _unreadCount = signal(0);
    private countRequest?: Subscription;
    private listRequest?: Subscription;
    private navigationTimer?: ReturnType<typeof setTimeout>;
    private pollTimer?: ReturnType<typeof setInterval>;

    readonly hasMore = this._hasMore.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly notifications = this._notifications.asReadonly();
    readonly unreadCount = this._unreadCount.asReadonly();

    constructor() {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => this.scheduleNavigationRefresh());

        effect(() => {
            const config = this._config();
            const isAuthenticated = this.sessionService.isAuthenticated();

            untracked(() => this.sync(isAuthenticated ? config : null));
        });
    }

    load(isMore = false): void {
        const config = this.activeConfig();

        if (!config || (isMore && (!this._hasMore() || this._isLoading()))) {
            return;
        }

        const before = isMore ? this._notifications().at(-1)?.createdAt : undefined;

        this.listRequest?.unsubscribe();
        this._isLoading.set(true);
        this.listRequest = this.notificationsHttpService
            .list(config.baseUrl, config.pageSize, before)
            .pipe(finalize(() => this._isLoading.set(false)))
            .subscribe({ error: ignoreError, next: page => this.apply(page, isMore) });
    }

    markAllRead(): void {
        const config = this.activeConfig();

        if (!config) {
            return;
        }

        this.notificationsHttpService.markAllRead(config.baseUrl).subscribe({
            error: ignoreError,
            next: () => {
                const readAt = Date.now();

                this._notifications.update(notifications =>
                    notifications.map(notification =>
                        notification.readAt === null ? { ...notification, readAt } : notification
                    )
                );
                this._unreadCount.set(0);
            }
        });
    }

    markRead(id: string): void {
        const config = this.activeConfig();
        const loaded = this._notifications().find(notification => notification.id === id);

        if (!config || (loaded && loaded.readAt !== null)) {
            return;
        }

        this.notificationsHttpService.markRead(config.baseUrl, id).subscribe({
            error: ignoreError,
            next: () => {
                if (!loaded) {
                    this.refresh();

                    return;
                }

                const readAt = Date.now();

                this._notifications.update(notifications =>
                    notifications.map(notification =>
                        notification.id === id && notification.readAt === null
                            ? { ...notification, readAt }
                            : notification
                    )
                );
                this._unreadCount.update(count => Math.max(0, count - 1));
            }
        });
    }

    refresh(): void {
        const config = this.activeConfig();

        if (!config) {
            return;
        }

        this.countRequest?.unsubscribe();
        this.countRequest = this.notificationsHttpService
            .countUnread(config.baseUrl)
            .subscribe({ error: ignoreError, next: ({ unreadCount }) => this._unreadCount.set(unreadCount) });
    }

    start(config: NotificationsConfig): void {
        this._config.set(config);
    }

    stop(): void {
        this._config.set(null);
    }

    private activeConfig(): NotificationsConfig | null {
        return this.sessionService.isAuthenticated() ? this._config() : null;
    }

    private apply({ hasMore, results, unreadCount }: NotificationsPage, isMore: boolean): void {
        this._notifications.update(current => {
            if (!isMore) {
                return results;
            }

            const known = new Set(current.map(notification => notification.id));

            return [...current, ...results.filter(notification => !known.has(notification.id))];
        });
        this._hasMore.set(hasMore);
        this._unreadCount.set(unreadCount);
    }

    private halt(): void {
        clearInterval(this.pollTimer);
        clearTimeout(this.navigationTimer);
        this.pollTimer = undefined;
        this.navigationTimer = undefined;
        this.countRequest?.unsubscribe();
        this.listRequest?.unsubscribe();
    }

    private reset(): void {
        this._hasMore.set(false);
        this._isLoading.set(false);
        this._notifications.set([]);
        this._unreadCount.set(0);
    }

    private scheduleNavigationRefresh(): void {
        if (!this.activeConfig()) {
            return;
        }

        clearTimeout(this.navigationTimer);
        this.navigationTimer = this.ngZone.runOutsideAngular(() =>
            setTimeout(() => this.ngZone.run(() => this.refresh()), NOTIFICATIONS_NAVIGATION_DEBOUNCE_MS)
        );
    }

    private sync(config: NotificationsConfig | null): void {
        this.halt();

        if (!config) {
            this.reset();

            return;
        }

        this.refresh();
        this.pollTimer = this.ngZone.runOutsideAngular(() =>
            setInterval(() => this.ngZone.run(() => this.refresh()), config.pollIntervalMs)
        );
    }
}

function ignoreError(): void {}
