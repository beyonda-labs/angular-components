import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    BeyBadgeConfig,
    BeyBadgeVariant,
    BeyHeaderAction,
    BeyHeaderActionType,
    BeyHeaderComponent,
    BeyHeaderConfig,
    BeyHeaderVariant
} from '@beyonda-labs/angular-components';
import { faArrowLeft, faArrowUpFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyHeaderComponent, TranslateModule],
    selector: 'bey-header-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './header-style-guide.component.css'],
    templateUrl: './header-style-guide.component.html'
})
export class HeaderStyleGuideComponent {
    backConfig = this.buildConfig({
        backAction: new BeyHeaderAction({
            icon: faArrowLeft,
            key: 'back',
            type: BeyHeaderActionType.Text
        }),
        badge: new BeyBadgeConfig({
            label: 'angular-components-style-guide.header.badge',
            variant: BeyBadgeVariant.Primary
        }),
        menuActions: []
    });
    readonly config = this.buildConfig();
    subPageConfig = this.buildConfig({
        menuActions: [],
        variant: BeyHeaderVariant.SubPage
    });

    private buildConfig(
        overrides: Partial<Pick<BeyHeaderConfig, 'backAction' | 'badge' | 'menuActions' | 'variant'>> = {}
    ): BeyHeaderConfig {
        return new BeyHeaderConfig({
            leftActions: [
                new BeyHeaderAction({
                    key: 'edit',
                    type: BeyHeaderActionType.Text
                }),
                new BeyHeaderAction({
                    key: 'duplicate',
                    type: BeyHeaderActionType.Text
                })
            ],
            menuActions: [
                new BeyHeaderAction({
                    key: 'archive',
                    type: BeyHeaderActionType.Text
                }),
                new BeyHeaderAction({
                    key: 'delete',
                    type: BeyHeaderActionType.Text
                })
            ],
            prefix: 'angular-components-style-guide.header',
            rightActions: [
                new BeyHeaderAction({
                    icon: faArrowUpFromBracket,
                    key: 'export',
                    type: BeyHeaderActionType.SecondaryButton
                }),
                new BeyHeaderAction({
                    icon: faPlus,
                    key: 'new-goal',
                    subActions: [
                        new BeyHeaderAction({
                            key: 'individual-goal',
                            type: BeyHeaderActionType.Text
                        }),
                        new BeyHeaderAction({
                            key: 'team-goal',
                            type: BeyHeaderActionType.Text
                        })
                    ],
                    type: BeyHeaderActionType.PrimaryButton
                })
            ],
            title: 'angular-components-style-guide.header.title',
            ...overrides
        });
    }
}
