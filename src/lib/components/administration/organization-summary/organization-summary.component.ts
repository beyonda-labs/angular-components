import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

import { CardComponent } from '../../cards/card/card.component';
import { CardListComponent } from '../../cards/card-list/card-list.component';
import { CardStatsComponent } from '../../cards/card-stats/card-stats.component';
import { HeaderComponent } from '../../header/header.component';
import { HeaderConfig } from '../../header/models/header.model';
import { OrganizationSummaryConfig, OrganizationSummaryTexts } from './models/organization-summary.model';
import { OrganizationSummaryService } from './services/organization-summary.service';
import { OrganizationSummaryActionsService } from './services/organization-summary-actions.service';
import { OrganizationSummaryCardsService } from './services/organization-summary-cards.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CardComponent, CardListComponent, CardStatsComponent, HeaderComponent, TranslateModule],
    providers: [OrganizationSummaryService],
    selector: 'bey-organization-summary',
    standalone: true,
    styleUrls: ['./organization-summary.component.css'],
    templateUrl: './organization-summary.component.html'
})
export class OrganizationSummaryComponent {
    private readonly organizationSummaryActionsService = inject(OrganizationSummaryActionsService);
    private readonly organizationSummaryCardsService = inject(OrganizationSummaryCardsService);
    private readonly organizationSummaryService = inject(OrganizationSummaryService);
    private readonly translateService = inject(TranslateService);

    readonly config = input.required<OrganizationSummaryConfig>();

    readonly headerConfig = computed(() => {
        const { prefix } = this.config();

        return new HeaderConfig({ prefix, title: `${prefix}.title` });
    });
    readonly texts = computed<OrganizationSummaryTexts>(() => {
        const { prefix } = this.config();

        return { createdAt: `${prefix}.created-at` };
    });
    readonly view = computed(() => {
        const summary = this.organizationSummaryService.summary();
        const { prefix, rolesConfig } = this.config();
        const language = this.language();

        return summary
            ? this.organizationSummaryCardsService.buildView(prefix, summary, {
                  language,
                  onRoleClick: role => this.organizationSummaryActionsService.viewRole(rolesConfig, role)
              })
            : null;
    });

    private readonly language = toSignal(this.translateService.onLangChange.pipe(map(({ lang }) => lang)), {
        initialValue: this.translateService.currentLang || this.translateService.getDefaultLang()
    });

    constructor() {
        effect(() => {
            const { organizationsUrl } = this.config();

            untracked(() => this.organizationSummaryService.load(organizationsUrl));
        });
    }
}
