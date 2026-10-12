import { inject, Injectable, signal } from '@angular/core';

import { OrganizationSummary } from '../models/organization-summary.model';
import { OrganizationSummaryHttpService } from './organization-summary-http.service';

@Injectable()
export class OrganizationSummaryService {
    private readonly organizationSummaryHttpService = inject(OrganizationSummaryHttpService);

    private readonly _summary = signal<OrganizationSummary | null>(null);

    readonly summary = this._summary.asReadonly();

    load(organizationsUrl: string): void {
        this._summary.set(null);
        this.organizationSummaryHttpService.load(organizationsUrl).subscribe(summary => this._summary.set(summary));
    }
}
