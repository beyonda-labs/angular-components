import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyToggleField } from '../../../models/fields/property-toggle-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-property-toggle-field',
    standalone: true,
    styleUrls: ['./property-toggle-field.component.css'],
    templateUrl: './property-toggle-field.component.html'
})
export class PropertyToggleFieldComponent {
    readonly field = input.required<PropertyToggleField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<boolean>();

    onChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).checked);
    }
}
