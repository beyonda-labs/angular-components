import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormFileField } from '../../../models/fields/form-file-field.model';
import { trackControl } from '../control-state';

const BYTES_PER_UNIT = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

function formatBytes(bytes: number): string {
    let value = bytes;
    let unitIndex = 0;

    while (value >= BYTES_PER_UNIT && unitIndex < SIZE_UNITS.length - 1) {
        value /= BYTES_PER_UNIT;
        unitIndex += 1;
    }

    const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;

    return `${value.toFixed(decimals)} ${SIZE_UNITS[unitIndex]}`;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-file-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-file.component.css'],
    templateUrl: './field-file.component.html'
})
export class FormFileFieldComponent {
    readonly control = input.required<FormControl<File | null>>();
    readonly field = input.required<FormFileField>();
    readonly prefix = input.required<string>();

    readonly controlState = trackControl(this.control);

    readonly accept = computed(() => (this.field().accept.length > 0 ? this.field().accept.join(',') : null));
    readonly acceptLabel = computed(() => this.field().accept.join(', '));
    readonly maxSize = computed(() => {
        const { maxSizeBytes } = this.field();

        return maxSizeBytes === undefined ? '' : formatBytes(maxSizeBytes);
    });

    readonly clearIcon = faXmark;
    readonly fileIcon = faPaperclip;

    private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

    clear(): void {
        this.fileInput().nativeElement.value = '';
        this.setFile(null);
    }

    errorKey(): string | null {
        const control = this.control();

        if (!this.isInvalid()) {
            return null;
        }

        if (control.hasError('maxSizeBytes')) {
            return 'angular-components.form.file-field.too-large';
        }

        return control.hasError('accept') ? 'angular-components.form.file-field.unsupported-type' : null;
    }

    file(): File | null {
        return this.controlState.value();
    }

    fileSize(): string {
        const file = this.file();

        return file ? formatBytes(file.size) : '';
    }

    isDisabled(): boolean {
        return this.controlState.isDisabled();
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    onFileSelected(event: Event): void {
        const [file] = (event.target as HTMLInputElement).files ?? [];

        this.setFile(file ?? null);
    }

    openPicker(): void {
        this.fileInput().nativeElement.click();
    }

    private setFile(file: File | null): void {
        const control = this.control();

        control.setValue(file);
        control.markAsDirty();
        control.markAsTouched();
    }
}
