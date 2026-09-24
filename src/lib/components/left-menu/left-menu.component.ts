import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
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

    readonly expandedChange = output<boolean>();

    readonly expanded = linkedSignal(() => this.config().expanded);

    readonly bottomActions = computed(() => this.config().bottomActions ?? []);
    readonly topActions = computed(() => this.config().topActions ?? []);

    readonly titleClasses = computed(() => this.config().title.styles || '');
    readonly titleText = computed(() => {
        const title = this.config().title?.title ?? 'title';

        return !title || title === 'title' ? `${this.config().prefix}.title` : title;
    });

    readonly toggleTooltip = computed(() =>
        this.expanded() ? 'angular-components.left-menu.collapse' : 'angular-components.left-menu.expand'
    );

    readonly userFullName = computed(() => {
        const { userInfo } = this.config();

        return `${userInfo?.name ?? ''} ${userInfo?.surname ?? ''}`.trim();
    });
    readonly userTooltip = computed(() => this.config().userInfo?.email || this.userFullName());

    readonly collapseIcon = faAnglesLeft;
    readonly expandIcon = faAnglesRight;

    toggleExpanded(): void {
        this.expanded.update(isExpanded => !isExpanded);
        this.expandedChange.emit(this.expanded());
    }
}
