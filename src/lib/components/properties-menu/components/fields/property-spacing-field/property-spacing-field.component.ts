import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySpacingField } from '../../../models/fields/property-spacing-field.model';
import { PropertySpacingValue } from '../../../models/property-value.model';

const EMPTY_SPACING: PropertySpacingValue = { bottom: 0, left: 0, right: 0, top: 0 };
const SIDES: (keyof PropertySpacingValue)[] = ['top', 'right', 'bottom', 'left'];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-property-spacing-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-spacing-field.component.css'],
    templateUrl: './property-spacing-field.component.html'
})
export class PropertySpacingFieldComponent {
    readonly field = input.required<PropertySpacingField>();

    readonly valueChange = output<PropertySpacingValue>();

    readonly spacing = computed(() => this.field().value ?? EMPTY_SPACING);

    readonly sides = SIDES;

    onSideChange(side: keyof PropertySpacingValue, event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;

        this.valueChange.emit({ ...this.spacing(), [side]: rawValue === '' ? 0 : Number(rawValue) });
    }
}
