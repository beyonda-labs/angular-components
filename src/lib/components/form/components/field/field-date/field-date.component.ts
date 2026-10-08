import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { map, startWith, switchMap } from 'rxjs';

import { FormDateField } from '../../../models/fields/form-date-field.model';
import { DateFormatService } from '../../../services/date-format.service';
import { DatepickerLocaleService } from '../../../services/datepicker-locale.service';

type FormDatepickerConfig = Partial<BsDatepickerConfig & { locale: string }>;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BsDatepickerModule, ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-date-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-date.component.html'
})
export class FormDateFieldComponent {
    private readonly dateFormatService = inject(DateFormatService);
    private readonly datepickerLocaleService = inject(DatepickerLocaleService);
    private readonly translateService = inject(TranslateService);

    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormDateField>();
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly datepickerConfig = computed<FormDatepickerConfig>(() => ({
        dateInputFormat: this.field().format,
        locale: this.datepickerLocaleService.getLocale(this.language()),
        returnFocusToInput: true,
        showWeekNumbers: false
    }));
    readonly datepickerControl = new FormControl<Date | null>(null);
    readonly language = toSignal(this.translateService.onLangChange.pipe(map(event => event.lang)), {
        initialValue: this.translateService.currentLang || this.translateService.getDefaultLang()
    });
    readonly maxDate = computed(() => this.parseDate(this.field().maxDate) ?? undefined);
    readonly minDate = computed(() => this.parseDate(this.field().minDate) ?? undefined);
    readonly placeholder = computed(() => this.field().placeholder ?? this.field().format);

    constructor() {
        effect(() => {
            const language = this.language();

            untracked(() => this.datepickerLocaleService.use(language));
        });

        toObservable(this.control)
            .pipe(
                switchMap(control =>
                    control.events.pipe(
                        startWith(null),
                        map(() => control)
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe(control => {
                this.syncDatepickerState(control);
                this.syncDatepickerValue(control.value);
            });

        this.datepickerControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(value => this.onDatepickerValueChange(value));
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    markAsTouched(): void {
        this.control().markAsTouched();
    }

    private formatDate(value: Date | null): string | null {
        return this.dateFormatService.formatDate(value, this.field().format);
    }

    private onDatepickerValueChange(value: Date | null): void {
        const control = this.control();
        const formattedValue = this.formatDate(value);

        if (control.value !== formattedValue) {
            control.setValue(formattedValue);
        }

        control.markAsDirty();
        control.markAsTouched();
    }

    private parseDate(value?: string | null): Date | null {
        return this.dateFormatService.parseDate(value, this.field().format);
    }

    private syncDatepickerState(control: FormControl<string | null>): void {
        if (control.disabled !== this.datepickerControl.disabled) {
            if (control.disabled) {
                this.datepickerControl.disable({ emitEvent: false });
            } else {
                this.datepickerControl.enable({ emitEvent: false });
            }
        }
    }

    private syncDatepickerValue(value: string | null): void {
        const parsedValue = this.parseDate(value);

        if (this.formatDate(this.datepickerControl.value) !== this.formatDate(parsedValue)) {
            this.datepickerControl.setValue(parsedValue, { emitEvent: false });
        }
    }
}
