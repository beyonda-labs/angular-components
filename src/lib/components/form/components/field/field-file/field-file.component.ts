import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { formatBytes } from '../../../../../utilities/file-size';
import { FormFileField } from '../../../models/fields/form-file-field.model';
import { trackControl } from '../control-state';

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
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly accept = computed(() => (this.field().accept.length > 0 ? this.field().accept.join(',') : null));
    readonly acceptLabel = computed(() => this.field().accept.join(', '));
    readonly clearIcon = faXmark;
    readonly controlState = trackControl(this.control);
    readonly fileIcon = faPaperclip;
    readonly maxSize = computed(() => formatBytes(this.field().maxSizeBytes));

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
        return formatBytes(this.file()?.size);
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
