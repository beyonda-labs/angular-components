import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { modalFormGuard } from './modal-form.guard';

describe('modalFormGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
    });

    it('returns what the modal form service answers to canDeactivate', () => {
        jest.spyOn(TestBed.inject(FakeModalFormService), 'canDeactivate').mockReturnValue(false);

        const result = TestBed.runInInjectionContext(() =>
            modalFormGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(false);
    });
});
