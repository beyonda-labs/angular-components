import { inject, Injectable } from '@angular/core';

import { PageHandle } from '../../../page/models/page.model';
import {
    OrganizationDetail,
    OrganizationEditFields,
    OrganizationEditRequest,
    OrganizationRow,
    OrganizationsConfig
} from '../models/organizations.model';
import { OrganizationsFormService } from './organizations-form.service';
import { OrganizationsHttpService } from './organizations-http.service';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsActionsService {
    private readonly organizationsFormService = inject(OrganizationsFormService);
    private readonly organizationsHttpService = inject(OrganizationsHttpService);

    delete(
        { baseUrl, contentLabels, prefix }: OrganizationsConfig,
        organization: OrganizationRow,
        page?: PageHandle<OrganizationRow>
    ): void {
        if (!page) {
            return;
        }

        this.organizationsHttpService
            .loadContent(baseUrl, organization.id)
            .subscribe(({ counts }) =>
                page.openForm(
                    this.organizationsFormService.buildDeleteConfig({ contentLabels, counts, organization, prefix }),
                    ({ main }) =>
                        this.organizationsHttpService.deleteOrganization(
                            baseUrl,
                            organization.id,
                            main.name,
                            `${prefix}.toast.delete-success`
                        )
                )
            );
    }

    edit(
        { baseUrl, prefix }: OrganizationsConfig,
        organization: OrganizationRow,
        page?: PageHandle<OrganizationRow>
    ): void {
        if (!page) {
            return;
        }

        this.organizationsHttpService
            .loadOrganization(baseUrl, organization.id)
            .subscribe(detail =>
                page.openForm(this.organizationsFormService.buildEditFormConfig(prefix, detail), ({ main }) =>
                    this.organizationsHttpService.edit(
                        baseUrl,
                        organization.id,
                        toEditRequest(main, detail),
                        `${prefix}.toast.edit-success`
                    )
                )
            );
    }
}

function toEditRequest({ name, status }: OrganizationEditFields, current: OrganizationDetail): OrganizationEditRequest {
    return { name: name.trim(), ...(status !== current.status ? { status } : {}) };
}
