import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySegmentedField } from '../../../models/fields/property-segmented-field.model';
import { PropertyOption } from '../../../models/property-option.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-property-segmented-field',
    standalone: true,
    styleUrls: ['./property-segmented-field.component.css'],
    templateUrl: './property-segmented-field.component.html'
})
export class PropertySegmentedFieldComponent {
    readonly field = input.required<PropertySegmentedField>();

    readonly valueChange = output<unknown>();

    readonly enabledOptions = computed(() => this.field().options.filter(option => !option.disabled));

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    isActive(option: PropertyOption): boolean {
        return this.field().value === option.value;
    }

    onKeydown(event: KeyboardEvent): void {
        const options = this.enabledOptions();

        if (options.length === 0) {
            return;
        }

        const currentIndex = options.findIndex(option => option.value === this.field().value);
        let targetIndex: number;

        switch (event.key) {
            case 'ArrowRight':
                targetIndex = (currentIndex + 1) % options.length;
                break;
            case 'ArrowLeft':
                targetIndex = (currentIndex - 1 + options.length) % options.length;
                break;
            case 'Home':
                targetIndex = 0;
                break;
            case 'End':
                targetIndex = options.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        this.selectOption(options[targetIndex]);
        this.focusOption(options[targetIndex]);
    }

    selectOption(option: PropertyOption): void {
        if (option.disabled || this.field().disabled) {
            return;
        }

        this.valueChange.emit(option.value);
    }

    private focusOption(option: PropertyOption): void {
        const buttons = this.elementRef.nativeElement.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        const index = this.field().options.findIndex(current => current.value === option.value);

        buttons[index]?.focus();
    }
}
