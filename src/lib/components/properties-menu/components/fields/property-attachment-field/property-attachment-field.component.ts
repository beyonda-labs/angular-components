import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDollarSign, faFileArrowUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import {
    PropertyAttachmentField,
    PropertyAttachmentOption
} from '../../../models/fields/property-attachment-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { VariablePickerComponent } from '../../variable-picker/variable-picker.component';

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule, VariablePickerComponent],
    selector: 'bey-property-attachment-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-attachment-field.component.css'],
    templateUrl: './property-attachment-field.component.html'
})
export class PropertyAttachmentFieldComponent {
    @Input({ required: true }) field!: PropertyAttachmentField;

    @Output() uploadRequested = new EventEmitter<File>();
    @Output() valueChange = new EventEmitter<string>();

    readonly clearIcon = faXmark;
    readonly uploadIcon = faFileArrowUp;
    readonly variableIcon = faDollarSign;

    isOpen = false;
    pickerOpen = false;
    query = '';
    sizeErrorMaxSizeMB?: number;

    get selected(): PropertyAttachmentOption | undefined {
        return this.field.selectedOption;
    }

    get selectedLabel(): string {
        return this.selected?.label ?? this.field.value ?? '';
    }

    toggleVariablePicker(): void {
        this.pickerOpen = !this.pickerOpen;

        if (this.pickerOpen) {
            this.close();
        }
    }

    closeVariablePicker(): void {
        this.pickerOpen = false;
    }

    onVariableSelected(variable: PropertyVariable): void {
        this.closeVariablePicker();
        this.valueChange.emit(`{{ ${variable.path} }}`);
    }

    get filteredOptions(): PropertyAttachmentOption[] {
        const term = this.query.trim().toLowerCase();

        if (!term) {
            return this.field.options;
        }

        return this.field.options.filter(option => option.label.toLowerCase().includes(term));
    }

    onQueryInput(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.isOpen = true;
    }

    onFocus(): void {
        this.isOpen = true;
        this.query = '';
    }

    onOptionPicked(option: PropertyAttachmentOption, event: Event): void {
        event.preventDefault();

        if (option.disabled) {
            return;
        }

        this.close();
        this.valueChange.emit(option.id);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    onClear(): void {
        this.sizeErrorMaxSizeMB = undefined;
        this.valueChange.emit('');
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (!file) {
            return;
        }

        if (this.field.maxSizeBytes !== undefined && file.size > this.field.maxSizeBytes) {
            this.sizeErrorMaxSizeMB = Math.round(this.field.maxSizeBytes / (1024 * 1024));

            return;
        }

        this.sizeErrorMaxSizeMB = undefined;
        this.uploadRequested.emit(file);
    }

    close(): void {
        this.isOpen = false;
        this.query = '';
    }
}
