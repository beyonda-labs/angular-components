import { Injectable, signal } from '@angular/core';
import { BeyStorageService } from '@beyonda-labs/angular-components';

@Injectable()
export class FakeStorageService implements Pick<BeyStorageService, 'clear' | 'get' | 'remove' | 'set'> {
    private readonly _items = signal<Record<string, string | undefined>>({});

    clear(): void {
        this._items.set({});
    }

    get<T>(key: string): T | null {
        const value = this._items()[key];

        return value === undefined ? null : (JSON.parse(value) as T);
    }

    remove(key: string): void {
        this._items.update(items => Object.fromEntries(Object.entries(items).filter(([current]) => current !== key)));
    }

    set<T>(key: string, value: T): void {
        this._items.update(items => ({ ...items, [key]: JSON.stringify(value) }));
    }
}
