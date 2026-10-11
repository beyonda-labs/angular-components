import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'bey-style-guide-open-sections';

@Injectable({
    providedIn: 'root'
})
export class StyleGuideSectionsService {
    private readonly _openKeys = signal<string[]>(loadOpenKeys());

    readonly openKeys = this._openKeys.asReadonly();

    collapseAll(): void {
        this.save([]);
    }

    expandAll(keys: string[]): void {
        this.save([...new Set(keys)]);
    }

    isOpen(key: string): boolean {
        return this._openKeys().includes(key);
    }

    open(key: string): void {
        if (!this.isOpen(key)) {
            this.save([...this._openKeys(), key]);
        }
    }

    toggle(key: string): void {
        this.save(this.isOpen(key) ? this._openKeys().filter(openKey => openKey !== key) : [...this._openKeys(), key]);
    }

    private save(keys: string[]): void {
        this._openKeys.set(keys);
        saveOpenKeys(keys);
    }
}

function loadOpenKeys(): string[] {
    try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');

        return Array.isArray(stored) ? stored.filter((key): key is string => typeof key === 'string') : [];
    } catch {
        return [];
    }
}

function saveOpenKeys(keys: string[]): boolean {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys));

        return true;
    } catch {
        return false;
    }
}
