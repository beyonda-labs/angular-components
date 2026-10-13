import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    HostListener,
    inject,
    Injector,
    input,
    signal,
    untracked,
    viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { map } from 'rxjs';

import { nextDomId } from '../../internal/dom-ids/dom-ids';
import { notificationText } from './functions/notification-text';
import { notificationTime } from './functions/notification-time';
import { Notification, NOTIFICATIONS_BADGE_MAX, NotificationsConfig } from './models/notifications.model';
import { NotificationsService } from './services/notifications.service';

const PANEL_GAP_PX = 8;
const PANEL_WIDTH_PX = 352;

interface NotificationItem {
    isUnread: boolean;
    notification: Notification;
    text: string;
    time: string;
}

interface PanelPosition {
    bottom: number | null;
    left: number;
    maxHeight: number;
    top: number | null;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-notifications',
    standalone: true,
    styleUrls: ['./notifications.component.css'],
    templateUrl: './notifications.component.html'
})
export class NotificationsComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly notificationsService = inject(NotificationsService);
    private readonly router = inject(Router);
    private readonly translateService = inject(TranslateService);

    readonly config = input.required<NotificationsConfig>();

    readonly badge = computed(() => badgeText(this.notificationsService.unreadCount()));
    readonly bellIcon = faBell;
    readonly bellLabel = computed(() =>
        this.hasUnread()
            ? 'angular-components.notifications.bell.unread'
            : 'angular-components.notifications.bell.label'
    );
    readonly bellParameters = computed(() => ({ count: this.notificationsService.unreadCount() }));
    readonly hasMore = this.notificationsService.hasMore;
    readonly hasUnread = computed(() => this.notificationsService.unreadCount() > 0);
    readonly isLoading = this.notificationsService.isLoading;
    readonly isOpen = signal(false);
    readonly items = computed(() => {
        const { entityLabels, labels } = this.config();
        const language = this.language();
        const now = this.now();
        const translate = (key: string, parameters?: Record<string, unknown>): string =>
            this.translateService.instant(key, parameters);

        return this.notificationsService.notifications().map(
            (notification): NotificationItem => ({
                isUnread: notification.readAt === null,
                notification,
                text: notificationText(notification, { entityLabels, labels }, translate),
                time: notificationTime(notification.createdAt, now, language, translate)
            })
        );
    });
    readonly panelId = nextDomId('bey-notifications-panel');
    readonly position = signal<PanelPosition>({ bottom: null, left: 0, maxHeight: 0, top: 0 });
    readonly refreshIcon = faRotateRight;
    readonly titleId = nextDomId('bey-notifications-title');

    private readonly language = toSignal(this.translateService.onLangChange.pipe(map(event => event.lang)), {
        initialValue: this.translateService.currentLang ?? ''
    });
    private readonly now = signal(Date.now());
    private readonly onAncestorScroll = (event: Event): void => {
        if (!this.panel()?.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    };
    private readonly onWindowResize = (): void => this.place();
    private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
    private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

    constructor() {
        effect(() => {
            const config = this.config();

            untracked(() => this.notificationsService.start(config));
        });
        this.destroyRef.onDestroy(() => {
            this.stopListening();
            this.notificationsService.stop();
        });
    }

    close(): void {
        if (!this.isOpen()) {
            return;
        }

        this.isOpen.set(false);
        this.stopListening();
    }

    markAllRead(): void {
        this.notificationsService.markAllRead();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    }

    @HostListener('keydown.escape')
    onEscape(): void {
        if (this.isOpen()) {
            this.close();
            this.trigger().nativeElement.focus();
        }
    }

    @HostListener('focusout', ['$event'])
    onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;

        if (next && !this.elementRef.nativeElement.contains(next)) {
            this.close();
        }
    }

    open(notification: Notification): void {
        if (notification.readAt === null) {
            this.notificationsService.markRead(notification.id);
        }

        const route = this.config().link?.(notification) ?? null;

        if (route) {
            this.close();
            this.router.navigateByUrl(route);
        }
    }

    reload(): void {
        this.now.set(Date.now());
        this.notificationsService.load();
    }

    showMore(): void {
        this.notificationsService.load(true);
    }

    toggle(): void {
        if (this.isOpen()) {
            this.close();

            return;
        }

        this.place();
        this.isOpen.set(true);
        this.reload();
        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('scroll', this.onAncestorScroll, { capture: true });
        afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
    }

    private place(): void {
        const rect = this.trigger().nativeElement.getBoundingClientRect();
        const { clientHeight, clientWidth } = document.documentElement;
        const left = Math.max(
            PANEL_GAP_PX,
            Math.min(rect.right + PANEL_GAP_PX, clientWidth - PANEL_WIDTH_PX - PANEL_GAP_PX)
        );
        const isBelowMiddle = rect.top > clientHeight / 2;

        this.position.set(
            isBelowMiddle
                ? { bottom: clientHeight - rect.bottom, left, maxHeight: rect.bottom - PANEL_GAP_PX, top: null }
                : { bottom: null, left, maxHeight: clientHeight - rect.top - PANEL_GAP_PX, top: rect.top }
        );
    }

    private stopListening(): void {
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
    }
}

function badgeText(count: number): string {
    if (count <= 0) {
        return '';
    }

    return count > NOTIFICATIONS_BADGE_MAX ? `${NOTIFICATIONS_BADGE_MAX}+` : String(count);
}
