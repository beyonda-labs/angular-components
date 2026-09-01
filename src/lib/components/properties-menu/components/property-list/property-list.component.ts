import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ListComponent } from '../../../list/list.component';
import { ListConfig } from '../../../list/models/list.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';
import { PropertyFieldComponent } from '../property-field/property-field.component';

const EMPTY_VALUE = '—';
const COPIED_FEEDBACK_MS = 1500;

@Component({
    imports: [FontAwesomeModule, ListComponent, NgClass, PropertyFieldComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-list',
    standalone: true,
    styleUrls: ['./property-list.component.css'],
    templateUrl: './property-list.component.html'
})
export class PropertyListComponent implements OnDestroy {
    @Input({ required: true }) groupId!: string;
    @Input({ required: true }) items: PropertyListItem[] = [];
    @Input({ required: true }) tabId!: string;

    readonly chevronIcon = faChevronDown;
    readonly copiedIcon = faCheck;
    readonly copyIcon = faCopy;

    copiedItemId?: string;
    readonly emptyValue = EMPTY_VALUE;
    readonly removeIcon = faTrash;

    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly propertiesMenuService = inject(PropertiesMenuService);

    private copiedTimeoutId?: ReturnType<typeof setTimeout>;

    get listConfig(): ListConfig {
        return new ListConfig<unknown>({
            getItemKey: item => this.asItem(item).id,
            items: this.items.filter(item => !item.hidden),
            onItemClick: item => this.onItemClick(this.asItem(item)),
            prefix: 'angular-components.properties-menu.list'
        });
    }

    ngOnDestroy(): void {
        clearTimeout(this.copiedTimeoutId);
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

    copyLabelKey(item: PropertyListItem): string {
        return this.copiedItemId === item.id
            ? 'angular-components.properties-menu.list.copied'
            : 'angular-components.properties-menu.list.copy';
    }

    async onCopy(event: Event, item: PropertyListItem): Promise<void> {
        event.stopPropagation();

        if (!item.copyValue) {
            return;
        }

        try {
            await navigator.clipboard.writeText(item.copyValue);
        } catch {
            return;
        }

        this.copiedItemId = item.id;
        clearTimeout(this.copiedTimeoutId);
        this.copiedTimeoutId = setTimeout(() => {
            this.copiedItemId = undefined;
            this.changeDetectorRef.markForCheck();
        }, COPIED_FEEDBACK_MS);
    }

    onAction(event: Event, item: PropertyListItem, key: string): void {
        event.stopPropagation();
        this.propertiesMenuService.triggerListItemAction(this.tabId, this.groupId, item.id, key);
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
