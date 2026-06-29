import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'bey-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly document = inject(DOCUMENT);
    private readonly themeSubject = new BehaviorSubject<Theme>(this.loadTheme());

    readonly theme$ = this.themeSubject.asObservable();

    get currentTheme(): Theme {
        return this.themeSubject.value;
    }

    constructor() {
        this.applyToBody(this.themeSubject.value);
    }

    setTheme(theme: Theme): void {
        this.themeSubject.next(theme);
        this.applyToBody(theme);
        this.saveTheme(theme);
    }

    private applyToBody(theme: Theme): void {
        this.document.body.classList.toggle('dark', theme === 'dark');
    }

    private loadTheme(): Theme {
        try {
            return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'light';
        } catch {
            return 'light';
        }
    }

    private saveTheme(theme: Theme): void {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch { /* SSR o modo privado */ }
    }
}
