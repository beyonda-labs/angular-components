import { Component, ElementRef, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { Tab, TabsConfig } from './models/tabs.model';

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-tabs',
    standalone: true,
    styleUrls: ['./tabs.component.css'],
    templateUrl: './tabs.component.html'
})
export class TabsComponent {
    @Input({ required: true })
    set config(value: TabsConfig) {
        this._config = value;
        this.activeTabKey = value?.activeTab ?? '';
    }
    get config(): TabsConfig {
        return this._config;
    }

    activeTabKey = '';

    private _config!: TabsConfig;

    constructor(private readonly elementReference: ElementRef<HTMLElement>) {}

    getTabLabel(tab: Tab): string {
        const defaultValue = `${tab.key}.label`;

        if (tab.label === defaultValue) {
            return `${this.config.prefix}.tabs.${defaultValue}`;
        }

        return tab.label;
    }

    getTabTooltip(tab: Tab): string {
        if (!tab.tooltip) {
            return '';
        }

        const defaultValue = `${tab.key}.tooltip`;

        if (tab.tooltip === defaultValue) {
            return `${this.config.prefix}.tabs.${defaultValue}`;
        }

        return tab.tooltip;
    }

    isActive(tab: Tab): boolean {
        return this.activeTabKey === tab.key;
    }

    onKeydown(event: KeyboardEvent): void {
        const enabledTabs = this.config.tabs.filter(t => !t.isDisabled);

        if (enabledTabs.length === 0) {
            return;
        }

        const currentIndex = enabledTabs.findIndex(t => t.key === this.activeTabKey);
        let targetIndex = -1;

        switch (event.key) {
            case 'ArrowRight':
                targetIndex = (currentIndex + 1) % enabledTabs.length;
                break;
            case 'ArrowLeft':
                targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
                break;
            case 'Home':
                targetIndex = 0;
                break;
            case 'End':
                targetIndex = enabledTabs.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();

        const targetTab = enabledTabs[targetIndex];
        this.selectTab(targetTab);
        this.focusTab(targetTab.key);
    }

    onTabClick(tab: Tab): void {
        if (tab.isDisabled) {
            return;
        }

        this.selectTab(tab);
    }

    private focusTab(key: string): void {
        const buttons = this.elementReference.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        const allTabs = this.config.tabs;
        const index = allTabs.findIndex(t => t.key === key);

        buttons[index]?.focus();
    }

    private selectTab(tab: Tab): void {
        this.activeTabKey = tab.key;
        this.config.setActiveTab(tab.key);
    }
}
