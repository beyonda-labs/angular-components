import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyGroup } from '../../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyGroupContentType,
    PropertyGroupTab,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from '../../models/property-group-content.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';
import { PropertyFieldComponent } from '../property-field/property-field.component';
import { PropertyListComponent } from '../property-list/property-list.component';
import { PropertyTreeComponent } from '../property-tree/property-tree.component';

@Component({
    imports: [FontAwesomeModule, PropertyFieldComponent, PropertyListComponent, PropertyTreeComponent, TranslateModule],
    selector: 'bey-property-group',
    standalone: true,
    styleUrls: ['./property-group.component.css'],
    templateUrl: './property-group.component.html'
})
export class PropertyGroupComponent {
    @Input({ required: true }) group!: PropertyGroup;
    @Input({ required: true }) tabId!: string;

    readonly addIcon = faPlus;
    readonly chevronIcon = faChevronDown;
    readonly removeIcon = faTrash;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get labelKey(): string {
        return resolvePropertyLabelKey(
            this.propertiesMenuService.config().prefix,
            'groups',
            this.group.id,
            this.group.label
        );
    }

    get fieldsContent(): PropertyFieldsContent | undefined {
        return this.group.content.type === PropertyGroupContentType.FIELDS ? this.group.content : undefined;
    }

    get listContent(): PropertyListContent | undefined {
        return this.group.content.type === PropertyGroupContentType.LIST ? this.group.content : undefined;
    }

    get tabsContent(): PropertyTabsContent | undefined {
        return this.group.content.type === PropertyGroupContentType.TABS ? this.group.content : undefined;
    }

    get treeContent(): PropertyTreeContent | undefined {
        return this.group.content.type === PropertyGroupContentType.TREE ? this.group.content : undefined;
    }

    get visibleFields(): PropertyFieldsContent['fields'] {
        return this.fieldsContent?.fields.filter(field => !field.hidden) ?? [];
    }

    get activeTabFields(): PropertyFieldsContent['fields'] {
        const content = this.tabsContent;
        const active = content?.tabs.find(tab => tab.id === content.activeTabId);

        return active?.fields.filter(field => !field.hidden) ?? [];
    }

    getContentTabLabelKey(tab: PropertyGroupTab): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'groups', tab.id, tab.label);
    }

    selectContentTab(contentTabId: string): void {
        if (this.group.disabled) {
            return;
        }

        this.propertiesMenuService.selectGroupTab(this.tabId, this.group.id, contentTabId);
    }

    toggle(): void {
        if (this.group.disabled || !this.group.showHeader) {
            return;
        }

        this.propertiesMenuService.toggleGroup(this.tabId, this.group.id);
    }

    remove(event: Event): void {
        event.stopPropagation();

        if (this.group.disabled) {
            return;
        }

        this.propertiesMenuService.removeGroup(this.tabId, this.group.id);
    }

    onEmptyAddBlockClick(): void {
        this.propertiesMenuService.triggerTreeAddBlock(this.tabId, this.group.id);
    }
}
