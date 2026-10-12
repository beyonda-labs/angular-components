import { inject, Injectable } from '@angular/core';

import { ModalFormService } from '../../../form/components/modal/services/modal-form.service';
import { RoleViewSettings } from '../../models/role-permissions.model';
import { RoleViewFormService } from '../../services/role-view-form.service';
import { OrganizationSummaryExtraRole } from '../models/organization-summary.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationSummaryActionsService {
    private readonly modalFormService = inject(ModalFormService);
    private readonly roleViewFormService = inject(RoleViewFormService);

    viewRole(
        rolesConfig: RoleViewSettings,
        { description, name, permissions = [] }: OrganizationSummaryExtraRole
    ): void {
        this.modalFormService.open(
            this.roleViewFormService.buildViewConfig(
                { ...rolesConfig, permissions: [] },
                { description: description ?? undefined, isBase: false, name, permissions }
            )
        );
    }
}
