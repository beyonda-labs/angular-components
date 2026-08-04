import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';

const DEFAULT_COLOR = '#000000';

@Component({
    selector: 'bey-property-color-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-color-field.component.css'],
    templateUrl: './property-color-field.component.html'
})
export class PropertyColorFieldComponent {
    @Input({ required: true }) field!: PropertyColorField;

    @Output() valueChange = new EventEmitter<string>();

    get colorValue(): string {
        return this.field.value || DEFAULT_COLOR;
    }

    onSwatchChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }

    onTextChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }
}
