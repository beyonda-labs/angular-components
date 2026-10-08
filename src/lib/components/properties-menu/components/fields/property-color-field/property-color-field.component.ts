import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';

const NATIVE_PICKER_FALLBACK_COLOR = '#000000';

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
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<string>();

    readonly clearIcon = faXmark;
    readonly hasValue = computed(() => Boolean(this.field().value));
    readonly pickerValue = computed(() => this.field().value || NATIVE_PICKER_FALLBACK_COLOR);
    readonly showsClear = computed(() => {
        const field = this.field();

        return this.hasValue() && !field.disabled && !field.readonly;
    });

    onClear(): void {
        this.valueChange.emit('');
    }

    onInputChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }
}
