import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormFileField } from '../../../models/fields/form-file-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

const BYTES_PER_UNIT = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-file-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-file.component.html'
})
export class FormFileFieldComponent implements OnInit {
    @Input() field: FormFileField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    clearIcon = faXmark;
    fileIcon = faPaperclip;

    control?: FormControl<File | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<File | null>;
        }
    }

    get accept(): string | null {
        return this.field.accept.length > 0 ? this.field.accept.join(',') : null;
    }

    getFileSize(): string {
        const file = this.control?.value;

        return file ? this.formatBytes(file.size) : '';
    }

    getMaxSize(): string {
        return this.field.maxSizeBytes === undefined ? '' : this.formatBytes(this.field.maxSizeBytes);
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    getErrorKey(): string | undefined {
        if (!this.isInvalid()) {
            return undefined;
        }

        if (this.control?.hasError('maxSizeBytes')) {
            return 'angular-components.form.fileField.tooLarge';
        }

        if (this.control?.hasError('accept')) {
            return 'angular-components.form.fileField.unsupportedType';
        }

        return undefined;
    }

    openPicker(): void {
        this.fileInput?.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const [file] = (event.target as HTMLInputElement).files ?? [];

        this.setFile(file ?? null);
    }

    clear(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }

        this.setFile(null);
    }

    private setFile(file: File | null): void {
        this.control?.setValue(file);
        this.control?.markAsDirty();
        this.control?.markAsTouched();
    }

    private formatBytes(bytes: number): string {
        let value = bytes;
        let unitIndex = 0;

        while (value >= BYTES_PER_UNIT && unitIndex < SIZE_UNITS.length - 1) {
            value /= BYTES_PER_UNIT;
            unitIndex += 1;
        }

        const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;

        return `${value.toFixed(decimals)} ${SIZE_UNITS[unitIndex]}`;
    }
}
