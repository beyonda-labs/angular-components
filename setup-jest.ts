import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

global.ResizeObserver = global.ResizeObserver ?? (ResizeObserverMock as unknown as typeof ResizeObserver);
