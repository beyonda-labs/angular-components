import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ModalFormService } from '../services/modal-form.service';
import { modalFormGuard } from './modal-form.guard';

describe('modalFormGuard', () => {
    const canDeactivate = jest.fn();

    beforeEach(() => {
        canDeactivate.mockReset();

        TestBed.configureTestingModule({
            providers: [{ provide: ModalFormService, useValue: { canDeactivate } }]
        });
    });

    it('returns what the modal form service answers to canDeactivate', () => {
        canDeactivate.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() =>
            modalFormGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(true);
        expect(canDeactivate).toHaveBeenCalled();
    });
});
