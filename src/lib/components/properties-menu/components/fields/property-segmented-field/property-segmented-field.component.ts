import { Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySegmentedField } from '../../../models/fields/property-segmented-field.model';
import { PropertyOption } from '../../../models/property-option.model';

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-property-segmented-field',
    standalone: true,
    styleUrls: ['./property-segmented-field.component.css'],
    templateUrl: './property-segmented-field.component.html'
})
export class PropertySegmentedFieldComponent {
    @Input({ required: true }) field!: PropertySegmentedField;

    @Output() valueChange = new EventEmitter<unknown>();

    private readonly elementRef = inject(ElementRef<HTMLElement>);

    isActive(option: PropertyOption): boolean {
        return this.field.value === option.value;
    }

    onKeydown(event: KeyboardEvent): void {
        const enabledOptions = this.field.options.filter(option => !option.disabled);

        if (enabledOptions.length === 0) {
            return;
        }

        const currentIndex = enabledOptions.findIndex(option => option.value === this.field.value);
        let targetIndex = -1;

        switch (event.key) {
            case 'ArrowRight':
                targetIndex = (currentIndex + 1) % enabledOptions.length;
                break;

            case 'ArrowLeft':
                targetIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
                break;

            case 'Home':
                targetIndex = 0;
                break;

            case 'End':
                targetIndex = enabledOptions.length - 1;
                break;

            default:
                return;
        }

        event.preventDefault();

        const targetOption = enabledOptions[targetIndex];

        this.selectOption(targetOption);
        this.focusOption(targetOption);
    }

    selectOption(option: PropertyOption): void {
        if (option.disabled || this.field.disabled) {
            return;
        }

        this.valueChange.emit(option.value);
    }

    private focusOption(option: PropertyOption): void {
        const buttons = (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
            '[role="radio"]'
        );
        const index = this.field.options.findIndex(current => current.value === option.value);

        buttons[index]?.focus();
    }
}
