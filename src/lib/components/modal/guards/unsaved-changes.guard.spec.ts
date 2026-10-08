import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { firstValueFrom, Observable } from 'rxjs';

import { UnsavedChangesService } from '../services/unsaved-changes.service';
import { unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
    });

    it('answers with what the unsaved changes service decides', async () => {
        const unsavedChanges = TestBed.inject(UnsavedChangesService);
        TestBed.runInInjectionContext(() => unsavedChanges.track(signal(true)));

        const result = TestBed.runInInjectionContext(() =>
            unsavedChangesGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, {} as RouterStateSnapshot)
        );

        await expect(firstValueFrom(result as Observable<boolean>)).resolves.toBe(false);
        expect(TestBed.inject(FakeModalService).confirmations()).toHaveLength(1);
    });
});
