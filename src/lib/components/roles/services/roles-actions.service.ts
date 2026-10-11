import { inject, Injectable } from '@angular/core';

import { ModalFormService } from '../../form/components/modal/services/modal-form.service';
import { RoleRow, RolesViewOptions } from '../models/roles.model';
import { RolesFormService } from './roles-form.service';

@Injectable({
    providedIn: 'root'
})
export class RolesActionsService {
    private readonly modalFormService = inject(ModalFormService);
    private readonly rolesFormService = inject(RolesFormService);

    viewPermissions(options: RolesViewOptions, role: RoleRow): void {
        this.modalFormService.open(this.rolesFormService.buildViewConfig(options, role));
    }
}
