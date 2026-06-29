import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private readonly count = signal(0);

    // eslint-disable-next-line unicorn/consistent-function-scoping
    readonly isLoading = computed(() => this.count() > 0);

    show(): void {
        this.count.update(value => value + 1);
    }

    hide(): void {
        this.count.update(value => Math.max(0, value - 1));
    }

    reset(): void {
        this.count.set(0);
    }
}
