import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { Tab, TabsConfig, TabsVariant } from './models/tabs.model';

const OVERFLOW_TRIGGER_ESTIMATED_WIDTH = 40;
const TAB_GAP_ESTIMATED_WIDTH = 4;

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-tabs',
    standalone: true,
    styleUrls: ['./tabs.component.css'],
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterViewInit, OnDestroy {
    @Input({ required: true })
    set config(value: TabsConfig) {
        this._config = value;
        this.activeTabKey = value?.activeTab ?? '';
        this.cachedTabWidths = [];
        this.visibleCount = value?.tabs.length ?? 0;
        this.scheduleRecalculate();
    }
    get config(): TabsConfig {
        return this._config;
    }

    @ViewChild('tabsRow', { static: false }) tabsRowRef?: ElementRef<HTMLElement>;

    activeTabKey = '';
    overflowMenuOpen = false;
    visibleCount = 0;

    readonly overflowIcon = faEllipsis;

    private _config!: TabsConfig;
    private cachedTabWidths: number[] = [];
    private previousContainerWidth = 0;
    private resizeObserver?: ResizeObserver;

    constructor(
        private readonly elementReference: ElementRef<HTMLElement>,
        private readonly ngZone: NgZone
    ) {}

    get isSegmented(): boolean {
        return this.config?.variant === TabsVariant.Segmented;
    }

    get overflowTabs(): Tab[] {
        return this.config?.tabs.slice(this.visibleCount) ?? [];
    }

    get visibleTabs(): Tab[] {
        return this.config?.tabs.slice(0, this.visibleCount) ?? [];
    }

    ngAfterViewInit(): void {
        this.observeResize();
        this.recalculate();
        this.scheduleRecalculate();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementReference.nativeElement.contains(event.target as Node)) {
            this.overflowMenuOpen = false;
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.overflowMenuOpen = false;
    }

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

    isActiveInOverflow(): boolean {
        return this.overflowTabs.some(tab => this.isActive(tab));
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

    onOverflowTabClick(tab: Tab): void {
        this.overflowMenuOpen = false;
        this.onTabClick(tab);
    }

    toggleOverflowMenu(): void {
        this.overflowMenuOpen = !this.overflowMenuOpen;
    }

    private focusTab(key: string): void {
        const buttons = this.elementReference.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        const allTabs = this.config.tabs;
        const index = allTabs.findIndex(t => t.key === key);

        buttons[index]?.focus();
    }

    private measureTabWidths(): number[] {
        if (!this.tabsRowRef) {
            return [];
        }

        const buttons = this.tabsRowRef.nativeElement.querySelectorAll<HTMLButtonElement>(
            '.bey-tabs-tab:not(.bey-tabs-overflow-trigger)'
        );

        return [...buttons].map(button => button.offsetWidth);
    }

    private observeResize(): void {
        this.resizeObserver = new ResizeObserver(entries => {
            const width = entries[0]?.contentRect.width ?? 0;

            if (Math.abs(width - this.previousContainerWidth) > 1) {
                this.ngZone.run(() => this.recalculate());
            }
        });
        this.resizeObserver.observe(this.elementReference.nativeElement);
    }

    /**
     * Mirrors BreadcrumbComponent's collapse strategy: only measure real button widths while every
     * tab is still rendered (visibleCount === tabs.length), cache them, then fit as many as possible
     * into the available width — moving the rest into the overflow menu. A containerWidth of 0 means
     * layout hasn't happened yet (e.g. detached/hidden or first paint), so everything stays visible
     * rather than being guessed into overflow.
     */
    private recalculate(): void {
        if (!this.config) {
            this.visibleCount = 0;

            return;
        }

        const { tabs } = this.config;
        const containerWidth = this.elementReference.nativeElement.offsetWidth;

        if (containerWidth === 0) {
            this.visibleCount = tabs.length;

            return;
        }

        if (this.visibleCount === tabs.length) {
            const measured = this.measureTabWidths();

            if (measured.length === tabs.length && measured.some(width => width > 0)) {
                this.cachedTabWidths = measured;
            }
        }

        if (this.cachedTabWidths.length !== tabs.length) {
            this.visibleCount = tabs.length;

            return;
        }

        this.previousContainerWidth = containerWidth;

        const widths = this.cachedTabWidths;
        let totalWidth = 0;

        for (const [index, width] of widths.entries()) {
            totalWidth += width + (index > 0 ? TAB_GAP_ESTIMATED_WIDTH : 0);
        }

        if (totalWidth <= containerWidth) {
            this.visibleCount = tabs.length;

            return;
        }

        const overflowReserve = OVERFLOW_TRIGGER_ESTIMATED_WIDTH + TAB_GAP_ESTIMATED_WIDTH;
        let budget = containerWidth - overflowReserve;
        let count = 0;

        for (const width of widths) {
            const needed = width + (count > 0 ? TAB_GAP_ESTIMATED_WIDTH : 0);

            if (budget - needed < 0) {
                break;
            }

            budget -= needed;
            count++;
        }

        count = Math.max(count, 1);

        const activeIndex = tabs.findIndex(tab => tab.key === this.activeTabKey);

        // Never hide the active tab in the overflow menu without any visible indication of it.
        if (activeIndex >= count) {
            count = activeIndex + 1;
        }

        this.visibleCount = count;
    }

    private scheduleRecalculate(): void {
        requestAnimationFrame(() => this.ngZone.run(() => this.recalculate()));
    }

    private selectTab(tab: Tab): void {
        this.activeTabKey = tab.key;
        this.config.setActiveTab(tab.key);
    }
}
