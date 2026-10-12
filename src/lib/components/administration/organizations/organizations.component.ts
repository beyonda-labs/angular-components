import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { OrganizationRow, OrganizationsConfig } from './models/organizations.model';
import { buildOrganizationsPageConfig } from './organizations-page-config';
import { OrganizationsActionsService } from './services/organizations-actions.service';
import { OrganizationsFormService } from './services/organizations-form.service';
import { OrganizationsTableService } from './services/organizations-table.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    selector: 'bey-organizations',
    standalone: true,
    styleUrls: ['./organizations.component.css'],
    templateUrl: './organizations.component.html'
})
export class OrganizationsComponent {
    private readonly organizationsActionsService = inject(OrganizationsActionsService);
    private readonly organizationsFormService = inject(OrganizationsFormService);
    private readonly organizationsTableService = inject(OrganizationsTableService);

    readonly config = input.required<OrganizationsConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const { prefix } = config;

        return buildOrganizationsPageConfig({
            config,
            formConfig: this.organizationsFormService.buildFormConfig(prefix),
            loadRow: organization =>
                this.organizationsTableService.loadRow(organization, {
                    onEdit: edited => this.organizationsActionsService.edit(config, edited, this.page),
                    prefix
                }),
            onDelete: organization => this.organizationsActionsService.delete(config, organization, this.page),
            onEdit: organization => this.organizationsActionsService.edit(config, organization, this.page),
            onReady: handle => (this.page = handle)
        });
    });

    private page?: PageHandle<OrganizationRow>;
}
