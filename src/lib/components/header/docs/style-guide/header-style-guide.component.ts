import { Component } from '@angular/core';
import { faArrowLeft, faArrowUpFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderComponent } from '../../header.component';
import { HeaderAction, HeaderActionType, HeaderConfig, HeaderVariant } from '../../models/header.model';

@Component({
    imports: [HeaderComponent, TranslateModule],
    selector: 'bey-header-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './header-style-guide.component.css'],
    templateUrl: './header-style-guide.component.html'
})
export class HeaderStyleGuideComponent {
    config = this.buildConfig();
    backConfig = this.buildConfig({
        backAction: new HeaderAction({
            icon: faArrowLeft,
            key: 'back',
            type: HeaderActionType.Text
        }),
        badge: { text: 'angular-components-style-guide.header.badge' },
        menuActions: []
    });
    subPageConfig = this.buildConfig({
        menuActions: [],
        variant: HeaderVariant.SubPage
    });

    private buildConfig(
        overrides: Partial<Pick<HeaderConfig, 'backAction' | 'badge' | 'menuActions' | 'variant'>> = {}
    ): HeaderConfig {
        return new HeaderConfig({
            leftActions: [
                new HeaderAction({
                    key: 'edit',
                    type: HeaderActionType.Text
                }),
                new HeaderAction({
                    key: 'duplicate',
                    type: HeaderActionType.Text
                })
            ],
            menuActions: [
                new HeaderAction({
                    key: 'archive',
                    type: HeaderActionType.Text
                }),
                new HeaderAction({
                    key: 'delete',
                    type: HeaderActionType.Text
                })
            ],
            prefix: 'angular-components-style-guide.header',
            rightActions: [
                new HeaderAction({
                    icon: faArrowUpFromBracket,
                    key: 'export',
                    type: HeaderActionType.SecondaryButton
                }),
                new HeaderAction({
                    icon: faPlus,
                    key: 'newGoal',
                    subActions: [
                        new HeaderAction({
                            key: 'individualGoal',
                            type: HeaderActionType.Text
                        }),
                        new HeaderAction({
                            key: 'teamGoal',
                            type: HeaderActionType.Text
                        })
                    ],
                    type: HeaderActionType.PrimaryButton
                })
            ],
            title: 'angular-components-style-guide.header.title',
            ...overrides
        });
    }
}
