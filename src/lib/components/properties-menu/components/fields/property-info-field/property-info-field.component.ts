import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { PropertyInfoField } from '../../../models/fields/property-info-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule],
    selector: 'bey-property-info-field',
    standalone: true,
    styleUrls: ['./property-info-field.component.css'],
    templateUrl: './property-info-field.component.html'
})
export class PropertyInfoFieldComponent {
    readonly field = input.required<PropertyInfoField>();
}
