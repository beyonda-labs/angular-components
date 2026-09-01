import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyFileField } from '../../../models/fields/property-file-field.model';

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-property-file-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-file-field.component.css'],
    templateUrl: './property-file-field.component.html'
})
export class PropertyFileFieldComponent {
    @Input({ required: true }) field!: PropertyFileField;
    @Output() valueChange = new EventEmitter<string>();

    readonly chooseIcon = faUpload;
    readonly clearIcon = faXmark;

    // The persisted field value is just base64 — the original filename isn't stored on the document,
    // so it's only known for the lifetime of this component after a fresh pick, not when a saved value
    // is loaded back into the editor.
    selectedFileName?: string;
    sizeErrorMaxSizeMB?: number;

    get hasValue(): boolean {
        return Boolean(this.field.value);
    }

    onClear(): void {
        this.selectedFileName = undefined;
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

        this.sizeErrorMaxSizeMB = undefined;

        // Rejecting an oversized file here — before it's even read into base64 — saves the user from
        // waiting through a save/preview round-trip only to discover item-problems.service.ts's
        // MAX_PDF_SOURCE_BYTES check rejected it server-side; that check still runs regardless, this is
        // purely a faster local echo of the same limit (see `field.maxSizeBytes`).
        if (this.field.maxSizeBytes !== undefined && file.size > this.field.maxSizeBytes) {
            this.sizeErrorMaxSizeMB = Math.round(this.field.maxSizeBytes / (1024 * 1024));

            return;
        }

        this.selectedFileName = file.name;

        const reader = new FileReader();

        reader.addEventListener('load', () => {
            const result = reader.result as string;
            const base64 = result.slice(result.indexOf(',') + 1);

            this.valueChange.emit(base64);
        });

        reader.readAsDataURL(file);
    }
}
