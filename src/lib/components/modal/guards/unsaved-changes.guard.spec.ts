import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UnsavedChangesService } from '../services/unsaved-changes.service';
import { unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
    const canDeactivate = jest.fn();

    beforeEach(() => {
        canDeactivate.mockReset();

        TestBed.configureTestingModule({
            providers: [{ provide: UnsavedChangesService, useValue: { canDeactivate } }]
        });
    });

    it('answers with what the unsaved changes service decides', () => {
        canDeactivate.mockReturnValue(false);

        const result = TestBed.runInInjectionContext(() =>
            unsavedChangesGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(false);
        expect(canDeactivate).toHaveBeenCalled();
    });
});
