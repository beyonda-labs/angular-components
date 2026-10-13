import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import {
    NOTIFICATIONS_MARK_ALL_READ_PATH,
    NOTIFICATIONS_UNREAD_COUNT_PATH,
    NotificationsMarkAllReadResponse,
    NotificationsPage,
    NotificationsUnreadCount
} from '../models/notifications.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationsHttpService {
    private readonly environmentConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    countUnread(baseUrl: string): Observable<NotificationsUnreadCount> {
        return this.httpService.get<NotificationsUnreadCount>(this.url(baseUrl, NOTIFICATIONS_UNREAD_COUNT_PATH), {
            handleError: ignoreError
        });
    }

    list(baseUrl: string, limit: number, before?: number): Observable<NotificationsPage> {
        return this.httpService.get<NotificationsPage>(this.url(baseUrl), {
            queryParams: before === undefined ? { limit } : { before, limit }
        });
    }

    markAllRead(baseUrl: string): Observable<NotificationsMarkAllReadResponse> {
        return this.httpService.post<NotificationsMarkAllReadResponse>(
            this.url(baseUrl, NOTIFICATIONS_MARK_ALL_READ_PATH),
            {}
        );
    }

    markRead(baseUrl: string, id: string): Observable<void> {
        return this.httpService.post<void>(this.url(baseUrl, `/${encodeURIComponent(id)}/read`), {});
    }

    private url(baseUrl: string, suffix = ''): string {
        const { baseUrl: origin, webApiPath } = this.environmentConfig;

        return `${origin}${webApiPath}${baseUrl}${suffix}`;
    }
}

function ignoreError(): void {}
