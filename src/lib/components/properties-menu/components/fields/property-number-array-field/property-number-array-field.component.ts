import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyNumberArrayField } from '../../../models/fields/property-number-array-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-property-number-array-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-number-array-field.component.css'],
    templateUrl: './property-number-array-field.component.html'
})
export class PropertyNumberArrayFieldComponent {
    readonly field = input.required<PropertyNumberArrayField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<number[]>();

    readonly addIcon = faPlus;
    readonly canAdd = computed(() => {
        const { maxLength } = this.field();

        return maxLength === undefined || this.entries().length < maxLength;
    });
    readonly canRemove = computed(() => this.entries().length > this.field().minLength);
    readonly entries = computed(() => this.field().value ?? []);
    readonly removeIcon = faTrash;

    onAdd(): void {
        if (!this.canAdd()) {
            return;
        }

        this.valueChange.emit([...this.entries(), this.field().entryDefaultValue]);
    }

    onEntryChange(index: number, event: Event): void {
        const rawValue = (event.target as HTMLInputElement).value;
        const value = rawValue === '' ? 0 : Number(rawValue);

        this.valueChange.emit(this.entries().map((entry, entryIndex) => (entryIndex === index ? value : entry)));
    }

    onRemove(index: number): void {
        if (!this.canRemove()) {
            return;
        }

        this.valueChange.emit(this.entries().filter((_entry, entryIndex) => entryIndex !== index));
    }
}
