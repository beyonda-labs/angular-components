import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';

import { isNavigationOutcome } from './navigation-outcome';

describe('isNavigationOutcome', () => {
    it('is true for an event that ends a navigation, however it ends', () => {
        expect(isNavigationOutcome(new NavigationEnd(1, '/a', '/a'))).toBe(true);
        expect(isNavigationOutcome(new NavigationCancel(1, '/a', 'guard'))).toBe(true);
        expect(isNavigationOutcome(new NavigationError(1, '/a', new Error('failed')))).toBe(true);
    });

    it('is false for any other event', () => {
        expect(isNavigationOutcome(new NavigationStart(1, '/a'))).toBe(false);
        expect(isNavigationOutcome('/a')).toBe(false);
    });
});
