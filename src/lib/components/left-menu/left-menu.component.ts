import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ActionListComponent } from './components/action-list/action-list.component';
import { LeftMenuAction, LeftMenuConfig } from './models/left-menu.model';

@Component({
    imports: [ActionListComponent, FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-left-menu',
    standalone: true,
    styleUrls: ['./left-menu.component.css'],
    templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
    @Input({ required: true })
    set config(value: LeftMenuConfig) {
        this._config = value;
        this.expanded = value.expanded;
    }

    get config(): LeftMenuConfig {
        return this._config;
    }

    expanded = true;

    readonly collapseIcon = faAnglesLeft;
    readonly expandIcon = faAnglesRight;

    private _config!: LeftMenuConfig;

    get bottomActions(): LeftMenuAction[] {
        return this.config?.bottomActions ?? [];
    }

    get topActions(): LeftMenuAction[] {
        return this.config?.topActions ?? [];
    }

    getTitleClasses(): string {
        return this.config.title.styles || '';
    }

    getTitleText(): string {
        const title = this.config.title?.title ?? 'title';

        if (!title || title === 'title') {
            return `${this.config.prefix}.title`;
        }

        return title;
    }

    getToggleTooltip(): string {
        return this.expanded ? 'angular-components.left-menu.collapse' : 'angular-components.left-menu.expand';
    }

    getUserFullName(): string {
        const name = this.config.userInfo?.name ?? '';
        const surname = this.config.userInfo?.surname ?? '';

        return `${name} ${surname}`.trim();
    }

    getUserTooltip(): string {
        return this.config.userInfo?.email || this.getUserFullName();
    }

    toggleExpanded(): void {
        this.expanded = !this.expanded;
        this.config.expanded = this.expanded;
    }
}
