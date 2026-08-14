import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyNumberArrayField } from '../../../models/fields/property-number-array-field.model';

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-property-number-array-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-number-array-field.component.css'],
    templateUrl: './property-number-array-field.component.html'
})
export class PropertyNumberArrayFieldComponent {
    @Input({ required: true }) field!: PropertyNumberArrayField;

    @Output() valueChange = new EventEmitter<number[]>();

    readonly addIcon = faPlus;
    readonly removeIcon = faTrash;

    get entries(): number[] {
        return this.field.value ?? [];
    }

    get canAdd(): boolean {
        return this.field.maxLength === undefined || this.entries.length < this.field.maxLength;
    }

    get canRemove(): boolean {
        return this.entries.length > this.field.minLength;
    }

    onEntryChange(index: number, event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;
        const value = rawValue === '' ? 0 : Number(rawValue);

        this.valueChange.emit(this.entries.map((entry, entryIndex) => (entryIndex === index ? value : entry)));
    }

    onAdd(): void {
        if (!this.canAdd) {
            return;
        }

        this.valueChange.emit([...this.entries, this.field.entryDefaultValue]);
    }

    onRemove(index: number): void {
        if (!this.canRemove) {
            return;
        }

        this.valueChange.emit(this.entries.filter((_entry, entryIndex) => entryIndex !== index));
    }
}
