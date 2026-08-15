import { Component, inject, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyAttachmentField } from '../../models/fields/property-attachment-field.model';
import { PropertyColorField } from '../../models/fields/property-color-field.model';
import { PropertyFileField } from '../../models/fields/property-file-field.model';
import { PropertyInfoField } from '../../models/fields/property-info-field.model';
import { PropertyNumberArrayField } from '../../models/fields/property-number-array-field.model';
import { PropertyNumberField } from '../../models/fields/property-number-field.model';
import { PropertySegmentedField } from '../../models/fields/property-segmented-field.model';
import { PropertySelectField } from '../../models/fields/property-select-field.model';
import { PropertySpacingField } from '../../models/fields/property-spacing-field.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyToggleField } from '../../models/fields/property-toggle-field.model';
import { PropertyField } from '../../models/property-field.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyFieldType } from '../../types/property-field-type';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';
import { PropertyAttachmentFieldComponent } from '../fields/property-attachment-field/property-attachment-field.component';
import { PropertyColorFieldComponent } from '../fields/property-color-field/property-color-field.component';
import { PropertyFileFieldComponent } from '../fields/property-file-field/property-file-field.component';
import { PropertyInfoFieldComponent } from '../fields/property-info-field/property-info-field.component';
import { PropertyNumberArrayFieldComponent } from '../fields/property-number-array-field/property-number-array-field.component';
import { PropertyNumberFieldComponent } from '../fields/property-number-field/property-number-field.component';
import { PropertySegmentedFieldComponent } from '../fields/property-segmented-field/property-segmented-field.component';
import { PropertySelectFieldComponent } from '../fields/property-select-field/property-select-field.component';
import { PropertySpacingFieldComponent } from '../fields/property-spacing-field/property-spacing-field.component';
import {
    PropertyTextFieldActionTrigger,
    PropertyTextFieldComponent,
    PropertyTextFieldVariableInsertion
} from '../fields/property-text-field/property-text-field.component';
import { PropertyToggleFieldComponent } from '../fields/property-toggle-field/property-toggle-field.component';

@Component({
    imports: [
        PropertyAttachmentFieldComponent,
        PropertyColorFieldComponent,
        PropertyFileFieldComponent,
        PropertyInfoFieldComponent,
        PropertyNumberArrayFieldComponent,
        PropertyNumberFieldComponent,
        PropertySegmentedFieldComponent,
        PropertySelectFieldComponent,
        PropertySpacingFieldComponent,
        PropertyTextFieldComponent,
        PropertyToggleFieldComponent,
        TranslateModule
    ],
    selector: 'bey-property-field',
    standalone: true,
    styleUrls: ['./property-field.component.css'],
    templateUrl: './property-field.component.html'
})
export class PropertyFieldComponent {
    @Input({ required: true }) field!: PropertyField;
    @Input() hideLabel = false;

    readonly fieldType = PropertyFieldType;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get actionButtonTooltipKey(): string {
        return `${this.propertiesMenuService.config().prefix}.fields.${this.field.id}.actionButton.tooltip`;
    }

    get labelKey(): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'fields', this.field.id, this.field.label);
    }

    asAttachmentField(): PropertyAttachmentField {
        return this.field as PropertyAttachmentField;
    }

    asColorField(): PropertyColorField {
        return this.field as PropertyColorField;
    }

    asFileField(): PropertyFileField {
        return this.field as PropertyFileField;
    }

    asInfoField(): PropertyInfoField {
        return this.field as PropertyInfoField;
    }

    asNumberArrayField(): PropertyNumberArrayField {
        return this.field as PropertyNumberArrayField;
    }

    asNumberField(): PropertyNumberField {
        return this.field as PropertyNumberField;
    }

    asSegmentedField(): PropertySegmentedField {
        return this.field as PropertySegmentedField;
    }

    asSelectField(): PropertySelectField {
        return this.field as PropertySelectField;
    }

    asSpacingField(): PropertySpacingField {
        return this.field as PropertySpacingField;
    }

    asTextField(): PropertyTextField {
        return this.field as PropertyTextField;
    }

    asToggleField(): PropertyToggleField {
        return this.field as PropertyToggleField;
    }

    onValueChange(value: unknown): void {
        this.propertiesMenuService.updateFieldValue(this.field.id, value);
    }

    onUploadRequested(file: File): void {
        this.propertiesMenuService.requestAttachmentUpload(this.field.id, file);
    }

    onActionTriggered(event: PropertyTextFieldActionTrigger): void {
        this.propertiesMenuService.triggerFieldAction(this.field.id, event.key, event.selectionStart, event.selectionEnd);
    }

    onVariableInserted(event: PropertyTextFieldVariableInsertion): void {
        this.propertiesMenuService.applyVariableSelection(this.field.id, event.variable, event.value);
    }
}
