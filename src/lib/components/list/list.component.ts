import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ListConfig, ListItemContext } from './models/list.model';

@Component({
    imports: [NgTemplateOutlet, TranslateModule],
    selector: 'bey-list',
    standalone: true,
    styleUrls: ['./list.component.css'],
    templateUrl: './list.component.html'
})
export class ListComponent {
    @Input({ required: true }) config!: ListConfig;

    @ContentChild(TemplateRef) cardTemplate?: TemplateRef<ListItemContext>;

    getEmptyLabel(): string {
        return this.config.emptyLabel ?? `${this.config.prefix}.empty`;
    }

    getItemContext(item: unknown, index: number): ListItemContext {
        return { $implicit: item, index };
    }

    onItemClick(item: unknown, index: number): void {
        this.config.onItemClick?.(item, index);
    }

    onItemKeydown(event: Event, item: unknown, index: number): void {
        event.preventDefault();
        this.onItemClick(item, index);
    }

    trackByItem = (index: number, item: unknown): string | number => this.config.getItemKey?.(item, index) ?? index;
}
