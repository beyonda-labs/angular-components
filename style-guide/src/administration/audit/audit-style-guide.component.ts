import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyAuditComponent, BeyAuditConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAuditComponent, TranslateModule],
    selector: 'bey-audit-style-guide',
    standalone: true,
    styleUrls: ['../../style-guide-shared.css'],
    templateUrl: './audit-style-guide.component.html'
})
export class AuditStyleGuideComponent {
    readonly config = new BeyAuditConfig({
        baseUrl: '/style-guide/audit',
        entityLabels: {
            documents: 'angular-components-style-guide.audit.entities.documents',
            templates: 'angular-components-style-guide.audit.entities.templates'
        },
        actionLabels: {
            publish: 'angular-components-style-guide.audit.verbs.publish'
        },
        height: '24rem',
        storageKey: 'style-guide-audit',
        usersUrl: '/style-guide/users'
    });
}
