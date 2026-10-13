import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { buildAuditPageConfig } from './audit-page-config';
import { spansOrganizations } from './functions/audit-organizations';
import { AUDIT_USER_OPTIONS_LIMIT, AuditConfig, AuditEventRow } from './models/audit.model';
import { AuditActionsService } from './services/audit-actions.service';
import { AuditHttpService } from './services/audit-http.service';
import { AuditTableService } from './services/audit-table.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    providers: [UserOrganizationsService],
    selector: 'bey-audit',
    standalone: true,
    styleUrls: ['./audit.component.css'],
    templateUrl: './audit.component.html'
})
export class AuditComponent {
    private readonly auditActionsService = inject(AuditActionsService);
    private readonly auditHttpService = inject(AuditHttpService);
    private readonly auditTableService = inject(AuditTableService);
    private readonly userOrganizationsService = inject(UserOrganizationsService);

    readonly config = input.required<AuditConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const isSuperadmin = this.userOrganizationsService.isSuperadmin();
        const organizations = this.userOrganizationsService.organizations();
        const { actionLabels, baseUrl, entityLabels } = config;

        if (!organizations) {
            return null;
        }

        const onView = (event: AuditEventRow): void => this.auditActionsService.view(config, event);

        return buildAuditPageConfig({
            config,
            hasSeveralOrganizations: this.hasSeveralOrganizations.asReadonly(),
            isOrganizationShown: isSuperadmin,
            loadRow: event =>
                this.auditTableService.loadRow(event, {
                    actionLabels,
                    entityLabels,
                    isOrganizationShown: isSuperadmin,
                    onView
                }),
            onDataLoaded: ({ results }) => this.hasSeveralOrganizations.set(spansOrganizations(results)),
            onExport: () => this.auditActionsService.exportEvents(config, this.page),
            onReady: handle => (this.page = handle),
            onView,
            organizations,
            searchUsers: text => this.auditHttpService.searchUsers(baseUrl, text, AUDIT_USER_OPTIONS_LIMIT)
        });
    });

    private readonly hasSeveralOrganizations = signal(false);
    private page?: PageHandle<AuditEventRow>;

    constructor() {
        effect(() => {
            const { usersUrl } = this.config();

            untracked(() => this.userOrganizationsService.load(usersUrl));
        });
    }
}
