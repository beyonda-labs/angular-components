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

    it('should delegate to the modal form service', () => {
        canDeactivate.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() =>
            modalFormGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(true);
        expect(canDeactivate).toHaveBeenCalled();
    });
});
