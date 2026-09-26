import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PropertyNumberField } from '../../../models/fields/property-number-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-property-number-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-number-field.component.html'
})
export class PropertyNumberFieldComponent {
    readonly field = input.required<PropertyNumberField>();

    readonly valueChange = output<number>();

    onInput(event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;

        if (rawValue === '') {
            return;
        }

        this.valueChange.emit(Number(rawValue));
    }
}
