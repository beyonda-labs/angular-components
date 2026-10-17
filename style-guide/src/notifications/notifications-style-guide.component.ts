import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyNotification,
    BeyNotificationsComponent,
    BeyNotificationsConfig,
    BeyNotificationsService
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';
import { buildNotices } from './functions/notification-notices';
import { STYLE_GUIDE_REVIEW_REQUESTED } from './models/notifications-style-guide.model';
import { StyleGuideNotificationsService } from './services/style-guide-notifications.service';

const PREFIX = 'angular-components-style-guide.notifications';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyNotificationsComponent, TranslateModule],
    providers: [
        StyleGuideNotificationsService,
        { provide: BeyNotificationsService, useExisting: StyleGuideNotificationsService }
    ],
    selector: 'bey-notifications-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './notifications-style-guide.component.html'
})
export class NotificationsStyleGuideComponent {
    private readonly notificationsService = inject(StyleGuideNotificationsService);

    readonly config = new BeyNotificationsConfig({
        entityLabels: { templates: `${PREFIX}.entities.templates` },
        entityNouns: { templates: { one: `${PREFIX}.nouns.templates.one`, other: `${PREFIX}.nouns.templates.other` } },
        labels: { [STYLE_GUIDE_REVIEW_REQUESTED]: `${PREFIX}.types.review-requested` }
    });
    readonly scenarios: StyleGuideButton[] = [
        this.scenario('mixed', () => [buildNotices()]),
        this.scenario('pages', () => {
            const notices = buildNotices();

            return [notices.slice(0, 2), notices.slice(2, 4), notices.slice(4)];
        }),
        this.scenario('empty', () => [[]])
    ];

    constructor() {
        this.notificationsService.show([buildNotices()]);
    }

    private scenario(key: string, build: () => BeyNotification[][]): StyleGuideButton {
        return { action: () => this.notificationsService.show(build()), label: `${PREFIX}.scenarios.${key}` };
    }
}
