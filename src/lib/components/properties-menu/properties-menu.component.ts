import { Component, effect, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertiesMenuHeaderComponent } from './components/properties-menu-header/properties-menu-header.component';
import { PropertyTabComponent } from './components/property-tab/property-tab.component';
import { PropertyTabsComponent } from './components/property-tabs/property-tabs.component';
import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from './models/properties-menu-config.model';
import { PropertyTab } from './models/property-tab.model';
import { PropertyVariable, PropertyVariableParameters } from './models/property-variable.model';
import { PropertiesMenuService } from './services/properties-menu.service';
import { PropertyVariableService } from './services/property-variable.service';
import {
    PropertyAttachmentUpload,
    PropertyFieldAction,
    PropertyFieldValueChange,
    PropertyGroupRemove,
    PropertyGroupToggle,
    PropertyListItemSelect,
    PropertyTabAddRequested,
    PropertyTreeAddBlock,
    PropertyTreeNodeSelect,
    PropertyTreeNodeToggle,
    PropertyVariableSelection
} from './types/properties-menu-events';

@Component({
    imports: [PropertiesMenuHeaderComponent, PropertyTabComponent, PropertyTabsComponent, TranslateModule],
    providers: [PropertiesMenuService, PropertyVariableService],
    selector: 'bey-properties-menu',
    standalone: true,
    styleUrls: ['./properties-menu.component.css'],
    templateUrl: './properties-menu.component.html'
})
export class PropertiesMenuComponent {
    @Input({ required: true })
    set config(value: PropertiesMenuConfigParameters | PropertiesMenuConfig) {
        this.propertiesMenuService.setConfig(value);
        this.configChange.emit(this.propertiesMenuService.config());
    }

    get config(): PropertiesMenuConfig {
        return this.propertiesMenuService.config();
    }

    @Input()
    set variables(value: (PropertyVariableParameters | PropertyVariable)[]) {
        if (value) {
            this.propertyVariableService.setVariables(value);
        }
    }

    get variables(): PropertyVariable[] {
        return this.propertyVariableService.getVariables();
    }

    @Output() activeTabChange = new EventEmitter<string>();
    @Output() attachmentUpload = new EventEmitter<PropertyAttachmentUpload>();
    @Output() closed = new EventEmitter<void>();
    @Output() configChange = new EventEmitter<PropertiesMenuConfig>();
    @Output() fieldAction = new EventEmitter<PropertyFieldAction>();
    @Output() fieldValueChange = new EventEmitter<PropertyFieldValueChange>();
    @Output() groupRemove = new EventEmitter<PropertyGroupRemove>();
    @Output() groupToggle = new EventEmitter<PropertyGroupToggle>();
    @Output() listItemSelect = new EventEmitter<PropertyListItemSelect>();
    @Output() tabAddRequested = new EventEmitter<PropertyTabAddRequested>();
    @Output() treeAddBlock = new EventEmitter<PropertyTreeAddBlock>();
    @Output() treeNodeSelect = new EventEmitter<PropertyTreeNodeSelect>();
    @Output() treeNodeToggle = new EventEmitter<PropertyTreeNodeToggle>();
    @Output() variableSelected = new EventEmitter<PropertyVariableSelection>();

    @ViewChild('menuBody') private readonly menuBody?: ElementRef<HTMLElement>;

    private readonly propertiesMenuService = inject(PropertiesMenuService);
    private readonly propertyVariableService = inject(PropertyVariableService);

    constructor() {
        this.propertiesMenuService.onActiveTabChange = tabId => this.activeTabChange.emit(tabId);

        // Reset scroll to the top whenever the active tab changes — the body div is a single element
        // reused across tabs (only its projected content swaps), so the browser preserves its previous
        // scrollTop otherwise.
        effect(() => {
            this.propertiesMenuService.activeTabId();

            if (this.menuBody) {
                this.menuBody.nativeElement.scrollTop = 0;
            }
        });
        this.propertiesMenuService.onAttachmentUpload = upload => this.attachmentUpload.emit(upload);
        this.propertiesMenuService.onFieldAction = action => this.fieldAction.emit(action);
        this.propertiesMenuService.onFieldValueChange = change => this.fieldValueChange.emit(change);
        this.propertiesMenuService.onGroupRemove = event => this.groupRemove.emit(event);
        this.propertiesMenuService.onGroupToggle = toggle => this.groupToggle.emit(toggle);
        this.propertiesMenuService.onListItemSelect = event => this.listItemSelect.emit(event);
        this.propertiesMenuService.onTabAddRequested = event => this.tabAddRequested.emit(event);
        this.propertiesMenuService.onTreeAddBlock = event => this.treeAddBlock.emit(event);
        this.propertiesMenuService.onTreeNodeSelect = event => this.treeNodeSelect.emit(event);
        this.propertiesMenuService.onTreeNodeToggle = event => this.treeNodeToggle.emit(event);
        this.propertiesMenuService.onVariableSelected = selection => this.variableSelected.emit(selection);
    }

    get activeTab(): PropertyTab | undefined {
        const activeTabId = this.propertiesMenuService.activeTabId();

        return this.config.tabs.find(tab => tab.id === activeTabId);
    }

    get visibleTabs(): PropertyTab[] {
        return this.config.tabs.filter(tab => !tab.hidden);
    }

    get titleKey(): string {
        return this.config.title === 'title' ? `${this.config.prefix}.title` : this.config.title;
    }

    clearVariables(): void {
        this.propertyVariableService.clearVariables();
    }

    getVariables(): PropertyVariable[] {
        return this.propertyVariableService.getVariables();
    }

    setVariables(variables: (PropertyVariableParameters | PropertyVariable)[]): void {
        this.propertyVariableService.setVariables(variables);
    }

    onClose(): void {
        this.closed.emit();
    }
}
