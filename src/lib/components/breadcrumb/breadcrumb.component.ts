import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    NgZone,
    viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BreadcrumbConfig, BreadcrumbItem } from './models/breadcrumb.model';

const ELLIPSIS_ESTIMATED_WIDTH = 40;
const SEPARATOR_ESTIMATED_WIDTH = 20;

interface RenderedItem {
    item: BreadcrumbItem;
    label: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-breadcrumb',
    standalone: true,
    styleUrls: ['./breadcrumb.component.css'],
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements AfterViewInit {
    readonly config = input.required<BreadcrumbConfig>();

    readonly visibleStartIndex = linkedSignal(() => {
        this.config();

        return 0;
    });
    readonly collapsedItems = computed<RenderedItem[]>(() =>
        this.render(this.config().items.slice(0, this.visibleStartIndex()))
    );
    readonly collapsedItemsTooltip = computed(() =>
        this.collapsedItems()
            .map(entry => entry.label)
            .join(` ${this.config().separator} `)
    );
    readonly hasCollapsedItems = computed(() => this.visibleStartIndex() > 0);
    readonly visibleItems = computed<RenderedItem[]>(() =>
        this.render(this.config().items.slice(this.visibleStartIndex()))
    );

    private cachedItemWidths: number[] = [];

    private readonly translateService = inject(TranslateService);
    /* Label resolution goes through `instant`, so the rendered labels have to follow a language change. */
    private readonly language = toSignal(this.translateService.onLangChange, { initialValue: undefined });
    private readonly listElement = viewChild<ElementRef<HTMLOListElement>>('listElement');
    private previousContainerWidth = 0;
    private resizeObserver?: ResizeObserver;

    private readonly destroyRef = inject(DestroyRef);
    private readonly elementReference = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);

    constructor() {
        effect(() => {
            this.config();
            this.cachedItemWidths = [];
            this.previousContainerWidth = 0;
            this.scheduleRecalculate();
        });

        this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    }

    ngAfterViewInit(): void {
        this.observeResize();
        this.recalculate();
        this.scheduleRecalculate();
    }

    isLast(item: BreadcrumbItem): boolean {
        const { items } = this.config();

        return items.indexOf(item) === items.length - 1;
    }

    onItemClick(item: BreadcrumbItem): void {
        if (item.isDisabled || this.isLast(item)) {
            return;
        }

        this.config().onItemClick?.(item.id);
    }

    private countItemsToHide(widths: number[], containerWidth: number): number {
        let budget = containerWidth - (ELLIPSIS_ESTIMATED_WIDTH + SEPARATOR_ESTIMATED_WIDTH);
        let visibleCount = 0;

        for (let index = widths.length - 1; index >= 0; index--) {
            const needed = (widths[index] ?? 0) + (visibleCount > 0 ? SEPARATOR_ESTIMATED_WIDTH : 0);

            if (budget - needed < 0) {
                break;
            }

            budget -= needed;
            visibleCount++;
        }

        return Math.max(0, widths.length - Math.max(visibleCount, 1));
    }

    private measureItemWidths(): number[] {
        const list = this.listElement();

        if (!list) {
            return [];
        }

        const listItems = list.nativeElement.querySelectorAll<HTMLLIElement>('.bey-breadcrumb-item');

        return [...listItems].map(listItem => listItem.scrollWidth);
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
        const containerWidth = this.elementReference.nativeElement.offsetWidth;

        if (!this.listElement() || containerWidth === 0) {
            this.visibleStartIndex.set(0);

            return;
        }

        const { items } = this.config();

        if (this.visibleStartIndex() === 0) {
            const measured = this.measureItemWidths();

            if (measured.length === items.length && measured.some(width => width > 0)) {
                this.cachedItemWidths = measured;
            }
        }

        if (this.cachedItemWidths.length !== items.length || this.cachedItemWidths.length === 0) {
            this.visibleStartIndex.set(0);

            return;
        }

        this.previousContainerWidth = containerWidth;

        const widths = this.cachedItemWidths;
        const totalWidth = widths.reduce(
            (total, width, index) => total + width + (index < widths.length - 1 ? SEPARATOR_ESTIMATED_WIDTH : 0),
            0
        );

        if (totalWidth <= containerWidth) {
            this.visibleStartIndex.set(0);

            return;
        }

        this.visibleStartIndex.set(this.countItemsToHide(widths, containerWidth));
    }

    private render(items: BreadcrumbItem[]): RenderedItem[] {
        this.language();

        return items.map(item => ({ item, label: this.resolveLabel(item) }));
    }

    private resolveLabel(item: BreadcrumbItem): string {
        const { prefix, translate } = this.config();

        if (item.isTranslationKey) {
            return this.translateService.instant(item.label);
        }

        const label = translate && prefix ? `${prefix}.${item.label}` : item.label;

        return translate ? this.translateService.instant(label) : label;
    }

    private scheduleRecalculate(): void {
        requestAnimationFrame(() => this.ngZone.run(() => this.recalculate()));
    }
}
