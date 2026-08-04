import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PropertyNumberField } from '../../../models/fields/property-number-field.model';

@Component({
    selector: 'bey-property-number-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-number-field.component.html'
})
export class PropertyNumberFieldComponent {
    @Input({ required: true }) field!: PropertyNumberField;

    @Output() valueChange = new EventEmitter<number>();

    onInput(event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;

        if (rawValue === '') {
            return;
        }

        this.valueChange.emit(Number(rawValue));
    }
}
