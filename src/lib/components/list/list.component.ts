import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input, TemplateRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ListConfig, ListItemContext } from './models/list.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, TranslateModule],
    selector: 'bey-list',
    standalone: true,
    styleUrls: ['./list.component.css'],
    templateUrl: './list.component.html'
})
export class ListComponent<TItem = unknown> {
    readonly config = input.required<ListConfig<TItem>>();

    readonly cardTemplate = contentChild(TemplateRef<ListItemContext>);

    readonly emptyLabel = computed(() => this.config().emptyLabel ?? `${this.config().prefix}.empty`);
    readonly isClickable = computed(() => Boolean(this.config().onItemClick));

    getItemContext(item: TItem, index: number): ListItemContext {
        return { $implicit: item, index };
    }

    onItemClick(item: TItem, index: number): void {
        this.config().onItemClick?.(item, index);
    }

    onItemKeydown(event: Event, item: TItem, index: number): void {
        if (event.target !== event.currentTarget) {
            return;
        }

        event.preventDefault();
        this.onItemClick(item, index);
    }

    trackByItem = (index: number, item: TItem): string | number => this.config().getItemKey?.(item, index) ?? index;
}
