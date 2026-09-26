import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';

const DEFAULT_COLOR = '#000000';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-property-color-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-color-field.component.css'],
    templateUrl: './property-color-field.component.html'
})
export class PropertyColorFieldComponent {
    readonly field = input.required<PropertyColorField>();

    readonly valueChange = output<string>();

    readonly hasValue = computed(() => Boolean(this.field().value));
    /** The native colour input always needs a hex value for its own swatch; this fallback is never emitted. */
    readonly pickerValue = computed(() => this.field().value || DEFAULT_COLOR);
    readonly showsClear = computed(() => {
        const field = this.field();

        return this.hasValue() && !field.disabled && !field.readonly;
    });

    readonly clearIcon = faXmark;

    onClear(): void {
        this.valueChange.emit('');
    }

    onInputChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }
}
