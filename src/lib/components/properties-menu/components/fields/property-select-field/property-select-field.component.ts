import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySelectField } from '../../../models/fields/property-select-field.model';

@Component({
    imports: [TranslateModule],
    selector: 'bey-property-select-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-select-field.component.html'
})
export class PropertySelectFieldComponent {
    @Input({ required: true }) field!: PropertySelectField;

    @Output() valueChange = new EventEmitter<unknown>();

    onChange(event: Event): void {
        const rawValue = (event.target as HTMLSelectElement).value;
        const option = this.field.options.find(current => String(current.value) === rawValue);

        this.valueChange.emit(option ? option.value : rawValue);
    }
}
