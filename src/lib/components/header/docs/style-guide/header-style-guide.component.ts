import { Component } from '@angular/core';
import { faArrowUpFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderComponent } from '../../header.component';
import { HeaderAction, HeaderActionType, HeaderConfig } from '../../models/header.model';

@Component({
    imports: [HeaderComponent, TranslateModule],
    selector: 'bey-header-style-guide',
    standalone: true,
    templateUrl: './header-style-guide.component.html'
})
export class HeaderStyleGuideComponent {
    config = new HeaderConfig({
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
                type: HeaderActionType.PrimaryButton
            })
        ],
        title: 'angular-components-style-guide.header.title'
    });
}
