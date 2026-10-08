import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, PRIMARY_OUTLET, Router, UrlTree } from '@angular/router';
import { filter } from 'rxjs';

import { PageState } from '../models/page-state.model';

interface StoredPageState {
    path: string;
    state: PageState;
}

@Injectable({
    providedIn: 'root'
})
export class PageStateService {
    private readonly router = inject(Router);

    private readonly _states = signal<ReadonlyMap<string, StoredPageState>>(new Map());

    constructor() {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(event => this.forgetOutside(toPath(this.router.parseUrl(event.urlAfterRedirects))));
    }

    currentPath(): string {
        return toPath(this.router.parseUrl(this.router.url));
    }

    leave(path: string, prefix: string, state: PageState): void {
        const key = toKey(path, prefix);
        const isKept = isBelow(this.currentPath(), path);

        this._states.update(states => {
            const next = new Map(states);

            if (isKept) {
                next.set(key, { path, state });
            } else {
                next.delete(key);
            }

            return next;
        });
    }

    restore(path: string, prefix: string): PageState | undefined {
        const key = toKey(path, prefix);
        const stored = this._states().get(key);

        if (stored) {
            this._states.update(states => new Map([...states].filter(([current]) => current !== key)));
        }

        return stored?.state;
    }

    private forgetOutside(url: string): void {
        this._states.update(states => new Map([...states].filter(([, stored]) => isWithin(url, stored.path))));
    }
}

function isBelow(url: string, path: string): boolean {
    return url !== path && isWithin(url, path);
}

function isWithin(url: string, path: string): boolean {
    return url === path || url.startsWith(path.endsWith('/') ? path : `${path}/`);
}

function toKey(path: string, prefix: string): string {
    return `${prefix}@${path}`;
}

function toPath(tree: UrlTree): string {
    const segments = tree.root.children[PRIMARY_OUTLET]?.segments ?? [];

    return `/${segments.map(segment => segment.path).join('/')}`;
}
