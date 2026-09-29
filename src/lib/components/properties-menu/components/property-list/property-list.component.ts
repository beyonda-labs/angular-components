import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BadgeComponent } from '../../../badge/badge.component';
import { ListComponent } from '../../../list/list.component';
import { ListConfig } from '../../../list/models/list.model';
import { resolvePropertyLabelKey } from '../../functions/property-i18n';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyFieldComponent } from '../property-field/property-field.component';

const COPIED_FEEDBACK_MS = 1500;
const EMPTY_VALUE = '—';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BadgeComponent, FontAwesomeModule, ListComponent, PropertyFieldComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-list',
    standalone: true,
    styleUrls: ['./property-list.component.css'],
    templateUrl: './property-list.component.html'
})
export class PropertyListComponent {
    readonly groupId = input.required<string>();
    readonly items = input.required<PropertyListItem[]>();
    readonly tabId = input.required<string>();

    readonly chevronIcon = faChevronDown;
    readonly copiedIcon = faCheck;
    readonly copiedItemId = signal<string | null>(null);
    readonly copyIcon = faCopy;
    readonly emptyValue = EMPTY_VALUE;
    readonly listConfig = computed(
        () =>
            new ListConfig<unknown>({
                getItemKey: item => this.asItem(item).id,
                items: this.items().filter(item => !item.hidden),
                onItemClick: item => this.onItemClick(this.asItem(item)),
                prefix: 'angular-components.properties-menu.list'
            })
    );
    readonly removeIcon = faTrash;

    private copiedTimeoutId?: ReturnType<typeof setTimeout>;

    private readonly destroyRef = inject(DestroyRef);
    private readonly propertiesMenuService = inject(PropertiesMenuService);

    constructor() {
        this.destroyRef.onDestroy(() => clearTimeout(this.copiedTimeoutId));
    }

    asItem(item: unknown): PropertyListItem {
        return item as PropertyListItem;
    }

    copyLabelKey(item: PropertyListItem): string {
        return this.copiedItemId() === item.id
            ? 'angular-components.properties-menu.list.copied'
            : 'angular-components.properties-menu.list.copy';
    }

    labelKey(item: PropertyListItem): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'list', item.id, item.label);
    }

    onAction(event: Event, item: PropertyListItem, key: string): void {
        event.stopPropagation();
        this.propertiesMenuService.triggerListItemAction(this.tabId(), this.groupId(), item.id, key);
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

        this.copiedItemId.set(item.id);
        clearTimeout(this.copiedTimeoutId);
        this.copiedTimeoutId = setTimeout(() => this.copiedItemId.set(null), COPIED_FEEDBACK_MS);
    }

    onHeaderClick(item: PropertyListItem): void {
        if (item.isExpandable) {
            this.propertiesMenuService.toggleListItem(this.tabId(), this.groupId(), item.id);
        }
    }

    onRemove(event: Event, item: PropertyListItem): void {
        event.stopPropagation();
        this.propertiesMenuService.removeListItem(this.tabId(), this.groupId(), item.id);
    }

    onToggle(event: Event, item: PropertyListItem): void {
        event.stopPropagation();
        this.propertiesMenuService.toggleListItem(this.tabId(), this.groupId(), item.id);
    }

    toggleLabelKey(item: PropertyListItem): string {
        return item.expanded
            ? 'angular-components.properties-menu.list.collapse'
            : 'angular-components.properties-menu.list.expand';
    }

    private onItemClick(item: PropertyListItem): void {
        if (item.disabled || item.isExpandable) {
            return;
        }

        this.propertiesMenuService.selectListItem(this.tabId(), this.groupId(), item.id);
    }
}
