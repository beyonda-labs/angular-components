import { computed, Injectable, signal } from '@angular/core';
import { BeyNotification, BeyNotificationsService } from '@beyonda-labs/angular-components';

@Injectable()
export class StyleGuideNotificationsService
    implements
        Pick<
            BeyNotificationsService,
            | 'hasMore'
            | 'isLoading'
            | 'load'
            | 'markAllRead'
            | 'markRead'
            | 'notifications'
            | 'refresh'
            | 'start'
            | 'stop'
            | 'unreadCount'
        >
{
    private readonly _notifications = signal<BeyNotification[]>([]);
    private readonly _pages = signal<BeyNotification[][]>([]);
    private readonly _shownPages = signal(0);

    readonly hasMore = computed(() => this._shownPages() > 0 && this._shownPages() < this._pages().length);
    readonly isLoading = signal(false).asReadonly();
    readonly notifications = this._notifications.asReadonly();
    readonly unreadCount = computed(
        () =>
            this._pages()
                .flat()
                .filter(notification => notification.readAt === null).length
    );

    load(isMore = false): void {
        const shown = isMore ? Math.min(this._shownPages() + 1, this._pages().length) : 1;

        this._shownPages.set(shown);
        this._notifications.set(this._pages().slice(0, shown).flat());
    }

    markAllRead(): void {
        this.write(notification =>
            notification.readAt === null ? { ...notification, readAt: Date.now() } : notification
        );
    }

    markRead(id: string): void {
        this.write(notification => (notification.id === id ? { ...notification, readAt: Date.now() } : notification));
    }

    refresh(): void {}

    show(pages: BeyNotification[][]): void {
        this._pages.set(pages);
        this._shownPages.set(0);
        this._notifications.set([]);
    }

    start(): void {}

    stop(): void {}

    private write(change: (notification: BeyNotification) => BeyNotification): void {
        this._pages.update(pages => pages.map(page => page.map(change)));
        this._notifications.set(this._pages().slice(0, this._shownPages()).flat());
    }
}
