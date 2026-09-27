import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ActionListComponent } from './components/action-list/action-list.component';
import { LeftMenuConfig } from './models/left-menu.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ActionListComponent, FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-left-menu',
    standalone: true,
    styleUrls: ['./left-menu.component.css'],
    templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
    readonly config = input.required<LeftMenuConfig>();

    readonly bottomActions = computed(() => this.config().bottomActions ?? []);
    readonly collapseIcon = faAnglesLeft;
    readonly expanded = linkedSignal(() => this.config().expanded);
    readonly expandIcon = faAnglesRight;
    readonly titleText = computed(() => {
        const title = this.config().title?.title ?? 'title';

        return !title || title === 'title' ? `${this.config().prefix}.title` : title;
    });
    readonly toggleTooltip = computed(() =>
        this.expanded() ? 'angular-components.left-menu.collapse' : 'angular-components.left-menu.expand'
    );
    readonly topActions = computed(() => this.config().topActions ?? []);
    readonly userFullName = computed(() => {
        const { userInfo } = this.config();

        return `${userInfo?.name ?? ''} ${userInfo?.surname ?? ''}`.trim();
    });
    readonly userTooltip = computed(() => this.config().userInfo?.email || this.userFullName());

    toggleExpanded(): void {
        this.expanded.update(isExpanded => !isExpanded);
        this.config().onExpandedChange?.(this.expanded());
    }
}
