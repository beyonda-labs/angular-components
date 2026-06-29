import { Component, inject, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FormConfig, FormSection } from '../../models/form.model';
import { FormService } from '../../services/form.service';
import { FormRowComponent } from '../row/row.component';

@Component({
    imports: [FormRowComponent, TooltipModule, TranslateModule],
    selector: 'bey-form-section',
    standalone: true,
    styleUrls: ['./section.component.css'],
    templateUrl: './section.component.html'
})
export class FormSectionComponent {
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    private readonly formService = inject(FormService);

    getSectionLabel(): string {
        return `${this.getPrefix()}.label`;
    }

    getSectionTooltip(): string {
        if (this.section.isTooltipVisible) {
            return `${this.getPrefix()}.tooltip`;
        }

        return '';
    }

    isSectionVisible(): boolean {
        if (!this.section || !this.formConfig) {
            return false;
        }

        if (this.section.isHidden) {
            return false;
        }

        if (this.countFields() > 0 && !this.hasAnyVisibleField()) {
            return false;
        }

        return true;
    }

    private countFields(): number {
        return (this.section.rows ?? []).reduce((accumulator, row) => accumulator + row.fields.length, 0);
    }

    private getPrefix(): string {
        if (this.formConfig && this.section) {
            return this.formService.getSectionPrefix(this.formConfig, this.section);
        }

        return '';
    }

    private hasAnyVisibleField(): boolean {
        return this.section.rows.flatMap(row => row.fields).some(field => !field.isHidden);
    }
}
