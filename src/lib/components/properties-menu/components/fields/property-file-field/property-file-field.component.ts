import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyFileField } from '../../../models/fields/property-file-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';

const BYTES_PER_MB = 1024 * 1024;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-property-file-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-file-field.component.css'],
    templateUrl: './property-file-field.component.html'
})
export class PropertyFileFieldComponent {
    readonly field = input.required<PropertyFileField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<string>();

    readonly chooseIcon = faUpload;
    readonly clearIcon = faXmark;
    readonly hasValue = computed(() => Boolean(this.field().value));
    readonly selectedFileName = signal<string | null>(null);
    readonly showsClear = computed(() => this.hasValue() && !this.field().disabled);
    readonly sizeErrorMaxSizeMB = signal<number | null>(null);

    private isDestroyed = false;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            this.isDestroyed = true;
        });
    }

    onClear(): void {
        this.selectedFileName.set(null);
        this.sizeErrorMaxSizeMB.set(null);
        this.valueChange.emit('');
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        const { maxSizeBytes } = this.field();

        input.value = '';

        if (!file) {
            return;
        }

        this.sizeErrorMaxSizeMB.set(null);

        if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
            this.sizeErrorMaxSizeMB.set(Math.round(maxSizeBytes / BYTES_PER_MB));

            return;
        }

        this.selectedFileName.set(file.name);

        const reader = new FileReader();

        reader.addEventListener('load', () => {
            const result = reader.result as string;

            if (!this.isDestroyed) {
                this.valueChange.emit(result.slice(result.indexOf(',') + 1));
            }
        });
        reader.readAsDataURL(file);
    }
}
