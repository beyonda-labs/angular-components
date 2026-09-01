import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySpacingField } from '../../../models/fields/property-spacing-field.model';
import { PropertySpacingValue } from '../../../types/property-value';

const EMPTY_SPACING: PropertySpacingValue = { bottom: 0, left: 0, right: 0, top: 0 };

@Component({
    imports: [TranslateModule],
    selector: 'bey-property-spacing-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-spacing-field.component.css'],
    templateUrl: './property-spacing-field.component.html'
})
export class PropertySpacingFieldComponent {
    @Input({ required: true }) field!: PropertySpacingField;

    @Output() valueChange = new EventEmitter<PropertySpacingValue>();

    get spacing(): PropertySpacingValue {
        return this.field.value ?? EMPTY_SPACING;
    }

    onSideChange(side: keyof PropertySpacingValue, event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;

        this.valueChange.emit({ ...this.spacing, [side]: rawValue === '' ? 0 : Number(rawValue) });
    }
}
