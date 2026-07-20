import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

import { ModalFormService } from '../services/modal-form.service';

export const modalFormGuard: CanDeactivateFn<unknown> = (): Observable<boolean> | boolean =>
    inject(ModalFormService).canDeactivate();
