import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PropertyToggleField } from '../../../models/fields/property-toggle-field.model';

@Component({
    selector: 'bey-property-toggle-field',
    standalone: true,
    styleUrls: ['./property-toggle-field.component.css'],
    templateUrl: './property-toggle-field.component.html'
})
export class PropertyToggleFieldComponent {
    @Input({ required: true }) field!: PropertyToggleField;

    @Output() valueChange = new EventEmitter<boolean>();

    onChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).checked);
    }
}
