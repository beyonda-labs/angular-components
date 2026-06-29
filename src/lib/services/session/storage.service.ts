import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    clear(): void {
        localStorage.clear();
    }

    get<T>(key: string): T | null {
        const value = localStorage.getItem(key);

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }

    set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
