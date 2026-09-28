import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

import { UnsavedChangesService } from '../services/unsaved-changes.service';

export const unsavedChangesGuard: CanDeactivateFn<unknown> = (): Observable<boolean> | boolean =>
    inject(UnsavedChangesService).canDeactivate();
