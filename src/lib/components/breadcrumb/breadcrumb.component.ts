import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BreadcrumbConfig, BreadcrumbItem } from './models/breadcrumb.model';

const ELLIPSIS_ESTIMATED_WIDTH = 40;
const SEPARATOR_ESTIMATED_WIDTH = 20;

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-breadcrumb',
    standalone: true,
    styleUrls: ['./breadcrumb.component.css'],
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements AfterViewInit, OnDestroy {
    @Input({ required: true })
    set config(value: BreadcrumbConfig) {
        this._config = value;
        this.cachedItemWidths = [];
        this.previousContainerWidth = 0;
        this.recalculate();
    }
    get config(): BreadcrumbConfig {
        return this._config;
    }

    @ViewChild('listElement', { static: false }) listElement?: ElementRef<HTMLOListElement>;

    visibleStartIndex = 0;

    private _config!: BreadcrumbConfig;
    private cachedItemWidths: number[] = [];
    private previousContainerWidth = 0;
    private resizeObserver?: ResizeObserver;

    constructor(
        private readonly elementReference: ElementRef<HTMLElement>,
        private readonly ngZone: NgZone,
        private readonly translateService: TranslateService
    ) {}

    ngAfterViewInit(): void {
        this.observeResize();
        this.recalculate();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    get collapsedItems(): BreadcrumbItem[] {
        return this.config?.items.slice(0, this.visibleStartIndex) ?? [];
    }

    get collapsedItemsTooltip(): string {
        return this.collapsedItems
            .map(item => this.resolveLabel(item))
            .join(` ${this.config.separator} `);
    }

    get hasCollapsedItems(): boolean {
        return this.visibleStartIndex > 0;
    }

    get visibleItems(): BreadcrumbItem[] {
        return this.config?.items.slice(this.visibleStartIndex) ?? [];
    }

    getItemLabel(item: BreadcrumbItem): string {
        return this.config.translate && this.config.prefix ? `${this.config.prefix}.${item.label}` : item.label;
    }

    isLast(item: BreadcrumbItem): boolean {
        const items = this.config?.items ?? [];

        return items.indexOf(item) === items.length - 1;
    }

    resolveLabel(item: BreadcrumbItem): string {
        const label = this.getItemLabel(item);

        return this.config.translate ? this.translateService.instant(label) : label;
    }

    onItemClick(item: BreadcrumbItem): void {
        if (item.isDisabled || this.isLast(item)) {
            return;
        }

        this.config.onItemClick?.(item.id);
    }

    private measureItemWidths(): number[] {
        if (!this.listElement) {
            return [];
        }

        const listItems = this.listElement.nativeElement.querySelectorAll<HTMLLIElement>('.bey-breadcrumb-item');

        return [...listItems].map(li => li.scrollWidth);
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
        if (!this.config || !this.listElement) {
            this.visibleStartIndex = 0;

            return;
        }

        const containerWidth = this.elementReference.nativeElement.offsetWidth;

        if (containerWidth === 0) {
            this.visibleStartIndex = 0;

            return;
        }

        const { items } = this.config;

        if (this.visibleStartIndex === 0) {
            const measured = this.measureItemWidths();

            if (measured.length === items.length && measured.some(width => width > 0)) {
                this.cachedItemWidths = measured;
            }
        }

        if (this.cachedItemWidths.length !== items.length) {
            this.visibleStartIndex = 0;

            return;
        }

        this.previousContainerWidth = containerWidth;

        const itemWidths = this.cachedItemWidths;

        if (itemWidths.length === 0) {
            this.visibleStartIndex = 0;

            return;
        }

        const separatorWidth = SEPARATOR_ESTIMATED_WIDTH;
        let totalWidth = 0;

        for (let index = 0; index < itemWidths.length; index++) {
            totalWidth += itemWidths[index];

            if (index < itemWidths.length - 1) {
                totalWidth += separatorWidth;
            }
        }

        if (totalWidth <= containerWidth) {
            this.visibleStartIndex = 0;

            return;
        }

        const ellipsisWidth = ELLIPSIS_ESTIMATED_WIDTH + separatorWidth;
        let budget = containerWidth - ellipsisWidth;
        let visibleCount = 0;

        for (let index = items.length - 1; index >= 0; index--) {
            const itemWidth = itemWidths[index] ?? 0;
            const neededWidth = itemWidth + (visibleCount > 0 ? separatorWidth : 0);

            if (budget - neededWidth < 0) {
                break;
            }

            budget -= neededWidth;
            visibleCount++;
        }

        const computedStartIndex = Math.max(0, items.length - Math.max(visibleCount, 1));

        if (this.visibleStartIndex !== computedStartIndex) {
            this.visibleStartIndex = computedStartIndex;
        }
    }
}
