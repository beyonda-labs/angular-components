import { Injectable } from '@angular/core';

import { PageStateSnapshot } from '../models/page-state.model';

@Injectable({
    providedIn: 'root'
})
export class PageStateRegistry {
    private readonly snapshots = new Map<string, PageStateSnapshot>();

    clear(key: string): void {
        this.snapshots.delete(key);
    }

    clearAll(): void {
        this.snapshots.clear();
    }

    restore(key: string): PageStateSnapshot | undefined {
        return this.snapshots.get(key);
    }

    save(key: string, snapshot: PageStateSnapshot): void {
        this.snapshots.set(key, snapshot);
    }
}
