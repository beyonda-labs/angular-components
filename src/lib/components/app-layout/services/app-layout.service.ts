import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { AppLayoutBreadcrumbItem } from '../models/app-layout.model';

const STORAGE_KEY = 'bey-left-menu-expanded';

function loadExpanded(): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return stored === null ? true : stored === 'true';
    } catch {
        return true;
    }
}

function saveExpanded(value: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        /* storage unavailable: the state still lives in the signal */
    }
}

@Injectable({
    providedIn: 'root'
})
export class AppLayoutService {
    private readonly _activeActionKey = signal<string | null>(null);
    private readonly _breadcrumb = signal<AppLayoutBreadcrumbItem[]>([]);
    private readonly _expanded = signal(loadExpanded());
    private readonly breadcrumbClickSubject = new Subject<number>();
    private readonly menuClickSubject = new Subject<string>();

    readonly activeActionKey = this._activeActionKey.asReadonly();
    readonly breadcrumb = this._breadcrumb.asReadonly();
    readonly expanded = this._expanded.asReadonly();
    readonly onBreadcrumbClick$: Observable<number> = this.breadcrumbClickSubject.asObservable();
    readonly onMenuClick$: Observable<string> = this.menuClickSubject.asObservable();

    activeMenuAction(key: string): void {
        this._activeActionKey.set(key);
    }

    clearActiveAction(): void {
        this._activeActionKey.set(null);
    }

    clearBreadcrumb(): void {
        this._breadcrumb.set([]);
    }

    emitBreadcrumbClick(id: number): void {
        this.breadcrumbClickSubject.next(id);
    }

    emitMenuClick(key: string): void {
        this.menuClickSubject.next(key);
    }

    setBreadcrumb(items: AppLayoutBreadcrumbItem[]): void {
        this._breadcrumb.set(items);
    }

    setExpanded(value: boolean): void {
        this._expanded.set(value);
        saveExpanded(value);
    }
}
