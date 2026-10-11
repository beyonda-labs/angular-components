import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyNoticeAction,
    BeyNoticeActionType,
    BeyNoticeComponent,
    BeyNoticeConfig,
    BeyNoticeVariant,
    BeyToastService
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.notice';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyNoticeComponent, TranslateModule],
    selector: 'bey-notice-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './notice-style-guide.component.css'],
    templateUrl: './notice-style-guide.component.html'
})
export class NoticeStyleGuideComponent {
    private readonly toastService = inject(BeyToastService);

    readonly notices = [
        new BeyNoticeConfig({ message: `${PREFIX}.messages.info` }),
        new BeyNoticeConfig({
            actions: [
                new BeyNoticeAction({
                    action: () => this.confirm('reload'),
                    key: 'reload',
                    label: `${PREFIX}.actions.reload`,
                    type: BeyNoticeActionType.Primary
                }),
                new BeyNoticeAction({
                    action: () => this.confirm('dismiss'),
                    key: 'dismiss',
                    label: `${PREFIX}.actions.dismiss`
                })
            ],
            message: `${PREFIX}.messages.warning`,
            messageParameters: { name: 'Grace Hopper' },
            variant: BeyNoticeVariant.Warning
        }),
        new BeyNoticeConfig({ message: `${PREFIX}.messages.danger`, variant: BeyNoticeVariant.Danger })
    ];

    private confirm(action: string): void {
        this.toastService.showSuccess({ message: `${PREFIX}.toast.${action}` });
    }
}
