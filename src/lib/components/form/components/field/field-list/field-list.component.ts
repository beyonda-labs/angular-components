import { ChangeDetectionStrategy, Component, computed, input, isSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormListField } from '../../../models/fields/form-list-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-form-list-field',
    standalone: true,
    styleUrls: ['./field-list.component.css'],
    templateUrl: './field-list.component.html'
})
export class FormListFieldComponent {
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormListField>();
    readonly label = input.required<string>();
    readonly prefix = input.required<string>();

    readonly items = computed(() => {
        const { items } = this.field();

        return isSignal(items) ? items() : items;
    });
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
}
