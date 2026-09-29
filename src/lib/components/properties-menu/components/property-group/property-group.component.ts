import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { resolvePropertyLabelKey } from '../../functions/property-i18n';
import { PropertyField } from '../../models/property-field.model';
import { PropertyGroup, PropertyGroupVariant } from '../../models/property-group.model';
import { PropertyGroupContentType, PropertyGroupTab } from '../../models/property-group-content.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyFieldComponent } from '../property-field/property-field.component';
import { PropertyListComponent } from '../property-list/property-list.component';
import { PropertyTreeComponent } from '../property-tree/property-tree.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, PropertyFieldComponent, PropertyListComponent, PropertyTreeComponent, TranslateModule],
    selector: 'bey-property-group',
    standalone: true,
    styleUrls: ['./property-group.component.css'],
    templateUrl: './property-group.component.html'
})
export class PropertyGroupComponent {
    private readonly propertiesMenuService = inject(PropertiesMenuService);

    readonly group = input.required<PropertyGroup>();
    readonly tabId = input.required<string>();

    readonly activeTabFields = computed<PropertyField[]>(() => {
        const content = this.tabsContent();
        const active = content?.tabs.find(tab => tab.id === content.activeTabId);

        return active?.fields.filter(field => !field.hidden) ?? [];
    });
    readonly addIcon = faPlus;

    private static nextInstanceId = 0;
    readonly bodyId = `bey-property-group-${PropertyGroupComponent.nextInstanceId++}`;
    readonly chevronIcon = faChevronDown;
    readonly content = computed(() => this.group().content);
    readonly fieldsContent = computed(() => {
        const content = this.content();

        return content.type === PropertyGroupContentType.FIELDS ? content : undefined;
    });
    readonly isSecondary = computed(() => this.group().variant === PropertyGroupVariant.SECONDARY);
    readonly labelKey = computed(() =>
        resolvePropertyLabelKey(
            this.propertiesMenuService.config().prefix,
            'groups',
            this.group().id,
            this.group().label
        )
    );
    readonly listContent = computed(() => {
        const content = this.content();

        return content.type === PropertyGroupContentType.LIST ? content : undefined;
    });
    readonly removeIcon = faTrash;
    readonly tabsContent = computed(() => {
        const content = this.content();

        return content.type === PropertyGroupContentType.TABS ? content : undefined;
    });
    readonly treeContent = computed(() => {
        const content = this.content();

        return content.type === PropertyGroupContentType.TREE ? content : undefined;
    });
    readonly visibleFields = computed<PropertyField[]>(
        () => this.fieldsContent()?.fields.filter(field => !field.hidden) ?? []
    );

    contentTabLabelKey(tab: PropertyGroupTab): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'groups', tab.id, tab.label);
    }

    onEmptyAddBlockClick(): void {
        this.propertiesMenuService.triggerTreeAddBlock(this.tabId(), this.group().id);
    }

    remove(event: Event): void {
        event.stopPropagation();

        if (this.group().disabled) {
            return;
        }

        this.propertiesMenuService.removeGroup(this.tabId(), this.group().id);
    }

    selectContentTab(contentTabId: string): void {
        if (this.group().disabled) {
            return;
        }

        this.propertiesMenuService.selectGroupTab(this.tabId(), this.group().id, contentTabId);
    }

    toggle(): void {
        const group = this.group();

        if (group.disabled || !group.showHeader) {
            return;
        }

        this.propertiesMenuService.toggleGroup(this.tabId(), group.id);
    }
}
