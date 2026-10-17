import { NavigationCancel, NavigationEnd, NavigationError } from '@angular/router';

export function isNavigationOutcome(event: unknown): boolean {
    return event instanceof NavigationCancel || event instanceof NavigationEnd || event instanceof NavigationError;
}
