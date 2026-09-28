import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyNumberField } from '../../../models/fields/property-number-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-property-number-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-number-field.component.html'
})
export class PropertyNumberFieldComponent {
    readonly field = input.required<PropertyNumberField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<number>();

    onInput(event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;

        if (rawValue === '') {
            return;
        }

        this.valueChange.emit(Number(rawValue));
    }
}
