import { Injectable, signal } from '@angular/core';

import { keepListedRows } from '../functions/page-row';
import { PageItem } from '../models/page-item.model';

@Injectable()
export class PageSelectionService {
    private readonly _selected = signal<PageItem[]>([]);

    readonly selected = this._selected.asReadonly();

    clear(): void {
        this._selected.set([]);
    }

    isSelected(item: PageItem): boolean {
        return this._selected().some(selected => selected.id === item.id);
    }

    keepListed(items: PageItem[]): PageItem[] {
        return keepListedRows(this._selected(), items);
    }

    select(items: PageItem[]): void {
        this._selected.set(items);
    }
}
