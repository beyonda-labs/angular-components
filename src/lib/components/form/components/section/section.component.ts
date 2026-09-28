import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { toKeySegment } from '../../../../utilities/key-segment';
import { fieldStateKey, FormFieldStates } from '../../form.component';
import { FormRow, FormSection } from '../../models/form.model';
import { FormRowComponent } from '../row/row.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormRowComponent, TooltipModule, TranslateModule],
    selector: 'bey-form-section',
    standalone: true,
    styleUrls: ['./section.component.css'],
    templateUrl: './section.component.html'
})
export class FormSectionComponent {
    readonly fieldStates = input.required<FormFieldStates>();
    readonly group = input.required<FormGroup>();
    readonly prefix = input.required<string>();
    readonly section = input.required<FormSection>();

    readonly label = computed(() => `${this.sectionPrefix()}.label`);
    readonly sectionPrefix = computed(() => `${this.prefix()}.${toKeySegment(this.section().prefix)}`);
    readonly tooltip = computed(() => (this.section().isTooltipVisible ? `${this.sectionPrefix()}.tooltip` : ''));
    readonly visibleRows = computed(() => this.section().rows.filter(row => this.hasVisibleField(row)));

    private hasVisibleField(row: FormRow): boolean {
        const { key } = this.section();

        return row.fields.some(field => !this.fieldStates().get(fieldStateKey(key, field.key))?.isHidden);
    }
}
