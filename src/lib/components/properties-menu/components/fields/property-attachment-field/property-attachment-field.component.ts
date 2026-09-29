import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileArrowUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { isAcceptedMimeType } from '../../../../../internal/file/accept-pattern';
import { OptionPickerOption } from '../../../../../internal/option-picker/models/option-picker-option.model';
import { OptionPickerComponent } from '../../../../../internal/option-picker/option-picker.component';
import { toVariableOptions } from '../../../functions/property-variable-options';
import {
    PropertyAttachmentField,
    PropertyAttachmentOption
} from '../../../models/fields/property-attachment-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PROPERTY_VARIABLE_ICON } from '../../../models/property-variable.model';

const BYTES_PER_MB = 1024 * 1024;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, OptionPickerComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-attachment-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-attachment-field.component.css'],
    templateUrl: './property-attachment-field.component.html'
})
export class PropertyAttachmentFieldComponent {
    readonly field = input.required<PropertyAttachmentField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly uploadRequested = output<File>();
    readonly valueChange = output<string>();

    readonly attachmentsId = computed(() => `${this.labelling().controlId}-attachments`);
    readonly clearIcon = faXmark;
    readonly filteredOptions = computed(() => {
        const term = this.query().trim().toLowerCase();
        const { options } = this.field();

        return term ? options.filter(option => option.label.toLowerCase().includes(term)) : options;
    });
    readonly hasTypeError = signal(false);
    readonly inputValue = computed(() => (this.isOpen() ? this.query() : this.selectedLabel()));
    readonly isOpen = signal(false);
    readonly pickerOpen = signal(false);
    readonly query = signal('');
    readonly selectedLabel = computed(() => {
        const field = this.field();

        return field.selectedOption?.label ?? field.value ?? '';
    });
    readonly sizeErrorMaxSizeMB = signal<number | null>(null);
    readonly uploadIcon = faFileArrowUp;
    readonly variableIcon = PROPERTY_VARIABLE_ICON;
    readonly variableOptions = computed(() => toVariableOptions(this.field().variables));

    close(): void {
        this.isOpen.set(false);
        this.query.set('');
    }

    closeVariablePicker(): void {
        this.pickerOpen.set(false);
    }

    onClear(): void {
        this.clearFileErrors();
        this.valueChange.emit('');
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        const { accept, maxSizeBytes } = this.field();

        input.value = '';

        if (!file) {
            return;
        }

        this.clearFileErrors();

        if (!isAcceptedMimeType(this.acceptedMimeTypes(accept), file.type)) {
            this.hasTypeError.set(true);

            return;
        }

        if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
            this.sizeErrorMaxSizeMB.set(Math.round(maxSizeBytes / BYTES_PER_MB));

            return;
        }

        this.uploadRequested.emit(file);
    }

    onFocus(): void {
        this.isOpen.set(true);
        this.query.set('');
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    onOptionPicked(option: PropertyAttachmentOption, event: Event): void {
        event.preventDefault();

        if (option.disabled) {
            return;
        }

        this.close();
        this.valueChange.emit(option.id);
    }

    onQueryInput(event: Event): void {
        this.query.set((event.target as HTMLInputElement).value);
        this.isOpen.set(true);
    }

    onVariableSelected(option: OptionPickerOption): void {
        this.closeVariablePicker();
        this.valueChange.emit(`{{ ${option.value} }}`);
    }

    toggleVariablePicker(): void {
        this.pickerOpen.update(isOpen => !isOpen);

        if (this.pickerOpen()) {
            this.close();
        }
    }

    private acceptedMimeTypes(accept: string | undefined): string[] {
        return (accept ?? '')
            .split(',')
            .map(pattern => pattern.trim())
            .filter(Boolean);
    }

    private clearFileErrors(): void {
        this.hasTypeError.set(false);
        this.sizeErrorMaxSizeMB.set(null);
    }
}
