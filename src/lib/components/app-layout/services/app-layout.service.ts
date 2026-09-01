import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { AppLayoutBreadcrumbItem } from '../models/app-layout.model';

const STORAGE_KEY = 'bey-left-menu-expanded';

@Injectable({
    providedIn: 'root'
})
export class AppLayoutService {
    readonly onBreadcrumbClick$: Observable<number>;
    readonly onMenuClick$: Observable<string>;
    readonly activeAction$: Observable<string>;

    expanded: boolean;

    private readonly activeActionSubject = new Subject<string>();
    private readonly breadcrumbItemsSubject = new BehaviorSubject<AppLayoutBreadcrumbItem[]>([]);
    private readonly breadcrumbClickSubject = new Subject<number>();
    private readonly menuClickSubject = new Subject<string>();

    readonly breadcrumbItems$ = this.breadcrumbItemsSubject.asObservable();

    constructor() {
        this.onBreadcrumbClick$ = this.breadcrumbClickSubject.asObservable();
        this.activeAction$ = this.activeActionSubject.asObservable();
        this.onMenuClick$ = this.menuClickSubject.asObservable();
        this.expanded = this.loadExpanded();
    }

    setBreadcrumb(items: AppLayoutBreadcrumbItem[]): void {
        this.breadcrumbItemsSubject.next(items);
    }

    clearBreadcrumb(): void {
        this.breadcrumbItemsSubject.next([]);
    }

    emitBreadcrumbClick(id: number): void {
        this.breadcrumbClickSubject.next(id);
    }

    emitMenuClick(key: string): void {
        this.menuClickSubject.next(key);
    }

    activeMenuAction(actionKey: string): void {
        this.activeActionSubject.next(actionKey);
    }

    setExpanded(value: boolean): void {
        this.expanded = value;
        this.saveExpanded(value);
    }

    private loadExpanded(): boolean {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            return stored === null ? true : stored === 'true';
        } catch {
            return true;
        }
    }

    private saveExpanded(value: boolean): void {
        try {
            localStorage.setItem(STORAGE_KEY, String(value));
        } catch { /* SSR o modo privado */ }
    }
}
