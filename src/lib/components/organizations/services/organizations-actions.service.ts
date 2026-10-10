import { inject, Injectable } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import {
    OrganizationAdminFields,
    OrganizationAdminInvitation,
    OrganizationRow,
    OrganizationsConfig
} from '../models/organizations.model';
import { OrganizationsFormService } from './organizations-form.service';
import { OrganizationsHttpService } from './organizations-http.service';

const OPTIONAL_FIELDS = ['language', 'name', 'surname'] as const;

@Injectable({
    providedIn: 'root'
})
export class OrganizationsActionsService {
    private readonly organizationsFormService = inject(OrganizationsFormService);
    private readonly organizationsHttpService = inject(OrganizationsHttpService);

    inviteAdmin(
        { adminRole, prefix, usersUrl }: OrganizationsConfig,
        organization: OrganizationRow,
        page?: PageHandle<OrganizationRow>
    ): void {
        page?.openForm(this.organizationsFormService.buildInviteAdminFormConfig(prefix, organization), ({ main }) =>
            this.organizationsHttpService.inviteAdmin(
                usersUrl,
                toAdminInvitation(main, organization.id, adminRole),
                `${prefix}.toast.invite-admin-success`
            )
        );
    }
}

function toAdminInvitation(
    fields: OrganizationAdminFields,
    organizationId: string,
    adminRole: string
): OrganizationAdminInvitation {
    const texts = OPTIONAL_FIELDS.map(key => [key, fields[key]?.trim() ?? ''] as const).filter(([, value]) => value);

    return { email: fields.email.trim(), ...Object.fromEntries(texts), organizationId, roles: [adminRole] };
}
