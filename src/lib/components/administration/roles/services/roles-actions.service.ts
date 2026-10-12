import { inject, Injectable } from '@angular/core';

import { ModalFormService } from '../../../form/components/modal/services/modal-form.service';
import { PageHandle } from '../../../page/models/page.model';
import { RoleViewOptions } from '../../models/role-permissions.model';
import { RoleViewFormService } from '../../services/role-view-form.service';
import { toRoleCreateRequest } from '../functions/role-requests';
import { RoleRow, RolesDuplicateOptions } from '../models/roles.model';
import { RolesFormService } from './roles-form.service';
import { RolesHttpService } from './roles-http.service';

@Injectable({
    providedIn: 'root'
})
export class RolesActionsService {
    private readonly modalFormService = inject(ModalFormService);
    private readonly rolesFormService = inject(RolesFormService);
    private readonly rolesHttpService = inject(RolesHttpService);
    private readonly roleViewFormService = inject(RoleViewFormService);

    duplicate(options: RolesDuplicateOptions, role: RoleRow, page?: PageHandle<RoleRow>): void {
        const { baseUrl, prefix } = options;

        page?.openForm(this.rolesFormService.buildDuplicateConfig(options, role), value =>
            this.rolesHttpService.create(baseUrl, toRoleCreateRequest(value), `${prefix}.toast.duplicate-success`)
        );
    }

    viewPermissions(options: RoleViewOptions, role: RoleRow): void {
        this.modalFormService.open(this.roleViewFormService.buildViewConfig(options, role));
    }
}
