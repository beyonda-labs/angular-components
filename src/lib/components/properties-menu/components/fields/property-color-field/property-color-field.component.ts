import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';

const DEFAULT_COLOR = '#000000';

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-property-color-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-color-field.component.css'],
    templateUrl: './property-color-field.component.html'
})
export class PropertyColorFieldComponent {
    @Input({ required: true }) field!: PropertyColorField;

    @Output() valueChange = new EventEmitter<string>();

    readonly clearIcon = faXmark;

    get hasValue(): boolean {
        return Boolean(this.field.value);
    }

    // The native `<input type="color">` can't represent "no color" — it always needs a concrete hex
    // value to render its own swatch — so this fallback only feeds that picker's internal display, and
    // is never written back as the field's actual value.
    get pickerValue(): string {
        return this.field.value || DEFAULT_COLOR;
    }

    onClear(): void {
        this.valueChange.emit('');
    }

    onSwatchChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }

    onTextChange(event: Event): void {
        this.valueChange.emit((event.target as HTMLInputElement).value);
    }
}
