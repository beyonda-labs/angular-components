import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ListComponent } from '../../../list/list.component';
import { ListConfig } from '../../../list/models/list.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';
import { PropertyFieldComponent } from '../property-field/property-field.component';

const EMPTY_VALUE = '—';

@Component({
    imports: [FontAwesomeModule, ListComponent, NgClass, PropertyFieldComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-list',
    standalone: true,
    styleUrls: ['./property-list.component.css'],
    templateUrl: './property-list.component.html'
})
export class PropertyListComponent {
    @Input({ required: true }) groupId!: string;
    @Input({ required: true }) items: PropertyListItem[] = [];
    @Input({ required: true }) tabId!: string;

    readonly chevronIcon = faChevronDown;
    readonly emptyValue = EMPTY_VALUE;
    readonly removeIcon = faTrash;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get listConfig(): ListConfig {
        return new ListConfig<unknown>({
            getItemKey: item => this.asItem(item).id,
            items: this.items.filter(item => !item.hidden),
            onItemClick: item => this.onItemClick(this.asItem(item)),
            prefix: 'angular-components.properties-menu.list'
        });
    }

    asItem(item: unknown): PropertyListItem {
        return item as PropertyListItem;
    }

    getLabelKey(item: PropertyListItem): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'list', item.id, item.label);
    }

    getToggleLabelKey(item: PropertyListItem): string {
        return item.expanded
            ? 'angular-components.properties-menu.list.collapse'
            : 'angular-components.properties-menu.list.expand';
    }

    onRemove(event: Event, item: PropertyListItem): void {
        event.stopPropagation();
        this.propertiesMenuService.removeListItem(this.tabId, this.groupId, item.id);
    }

    onToggle(event: Event, item: PropertyListItem): void {
        event.stopPropagation();
        this.propertiesMenuService.toggleListItem(this.tabId, this.groupId, item.id);
    }

    onHeaderClick(item: PropertyListItem): void {
        if (item.isExpandable) {
            this.propertiesMenuService.toggleListItem(this.tabId, this.groupId, item.id);
        }
    }

    private onItemClick(item: PropertyListItem): void {
        if (item.disabled || item.isExpandable) {
            return;
        }

        this.propertiesMenuService.selectListItem(this.tabId, this.groupId, item.id);
    }
}
