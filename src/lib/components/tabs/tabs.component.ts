import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    HostListener,
    inject,
    input,
    linkedSignal,
    NgZone,
    signal,
    viewChild
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { Tab, TabsConfig, TabsVariant } from './models/tabs.model';

const OVERFLOW_TRIGGER_ESTIMATED_WIDTH = 40;
const TAB_GAP_ESTIMATED_WIDTH = 4;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-tabs',
    standalone: true,
    styleUrls: ['./tabs.component.css'],
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterViewInit {
    readonly config = input.required<TabsConfig>();

    readonly activeTabKey = linkedSignal(() => this.config().activeTab);
    readonly isOverflowMenuOpen = signal(false);
    readonly visibleCount = linkedSignal(() => this.config().tabs.length);

    readonly isSegmented = computed(() => this.config().variant === TabsVariant.Segmented);
    readonly overflowTabs = computed(() => this.config().tabs.slice(this.visibleCount()));
    readonly visibleTabs = computed(() => this.config().tabs.slice(0, this.visibleCount()));

    readonly overflowIcon = faEllipsis;

    private cachedTabWidths: number[] = [];
    private previousContainerWidth = 0;
    private resizeObserver?: ResizeObserver;

    private readonly tabsRow = viewChild<ElementRef<HTMLElement>>('tabsRow');

    private readonly destroyRef = inject(DestroyRef);
    private readonly elementReference = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);

    constructor() {
        effect(() => {
            this.config();
            this.cachedTabWidths = [];
            this.scheduleRecalculate();
        });

        this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    }

    ngAfterViewInit(): void {
        this.observeResize();
        this.recalculate();
        this.scheduleRecalculate();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementReference.nativeElement.contains(event.target as Node)) {
            this.isOverflowMenuOpen.set(false);
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.isOverflowMenuOpen.set(false);
    }

    getTabLabel(tab: Tab): string {
        const defaultValue = `${tab.key}.label`;

        if (tab.label === defaultValue) {
            return `${this.config().prefix}.tabs.${defaultValue}`;
        }

        return tab.label;
    }

    getTabTooltip(tab: Tab): string {
        if (!tab.tooltip) {
            return '';
        }

        const defaultValue = `${tab.key}.tooltip`;

        if (tab.tooltip === defaultValue) {
            return `${this.config().prefix}.tabs.${defaultValue}`;
        }

        return tab.tooltip;
    }

    isActive(tab: Tab): boolean {
        return this.activeTabKey() === tab.key;
    }

    isActiveInOverflow(): boolean {
        return this.overflowTabs().some(tab => this.isActive(tab));
    }

    onKeydown(event: KeyboardEvent): void {
        const enabledTabs = this.config().tabs.filter(tab => !tab.isDisabled);

        if (enabledTabs.length === 0) {
            return;
        }

        const currentIndex = enabledTabs.findIndex(tab => tab.key === this.activeTabKey());
        let targetIndex: number;

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

    onOverflowTabClick(tab: Tab): void {
        this.isOverflowMenuOpen.set(false);
        this.onTabClick(tab);
    }

    onTabClick(tab: Tab): void {
        this.selectTab(tab);
    }

    toggleOverflowMenu(): void {
        this.isOverflowMenuOpen.update(isOpen => !isOpen);
    }

    private focusTab(key: string): void {
        const buttons = this.elementReference.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        const index = this.config().tabs.findIndex(tab => tab.key === key);

        buttons[index]?.focus();
    }

    private measureTabWidths(): number[] {
        const row = this.tabsRow();

        if (!row) {
            return [];
        }

        const buttons = row.nativeElement.querySelectorAll<HTMLButtonElement>(
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

    private recalculate(): void {
        const { tabs } = this.config();
        const containerWidth = this.elementReference.nativeElement.offsetWidth;

        if (containerWidth === 0) {
            this.visibleCount.set(tabs.length);

            return;
        }

        if (this.visibleCount() === tabs.length) {
            const measured = this.measureTabWidths();

            if (measured.length === tabs.length && measured.some(width => width > 0)) {
                this.cachedTabWidths = measured;
            }
        }

        if (this.cachedTabWidths.length !== tabs.length) {
            this.visibleCount.set(tabs.length);

            return;
        }

        this.previousContainerWidth = containerWidth;

        const widths = this.cachedTabWidths;
        const totalWidth = widths.reduce(
            (total, width, index) => total + width + (index > 0 ? TAB_GAP_ESTIMATED_WIDTH : 0),
            0
        );

        if (totalWidth <= containerWidth) {
            this.visibleCount.set(tabs.length);

            return;
        }

        this.visibleCount.set(this.countTabsThatFit(widths, containerWidth, tabs));
    }

    private countTabsThatFit(widths: number[], containerWidth: number, tabs: Tab[]): number {
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

        const activeIndex = tabs.findIndex(tab => tab.key === this.activeTabKey());

        return activeIndex >= count ? activeIndex + 1 : count;
    }

    private scheduleRecalculate(): void {
        requestAnimationFrame(() => this.ngZone.run(() => this.recalculate()));
    }

    private selectTab(tab: Tab): void {
        if (tab.isDisabled || this.activeTabKey() === tab.key) {
            return;
        }

        this.activeTabKey.set(tab.key);
        this.config().onTabChange?.(tab.key);
    }
}
