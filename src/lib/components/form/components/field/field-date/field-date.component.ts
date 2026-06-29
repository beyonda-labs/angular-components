import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { FormDateField } from '../../../models/fields/form-date-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { DateFormatService } from '../../../services/date-format.service';
import { DatepickerLocaleService } from '../../../services/datepicker-locale.service';
import { FormService } from '../../../services/form.service';

type FormDatepickerConfig = Partial<BsDatepickerConfig & { locale: string }>;

@Component({
    imports: [ReactiveFormsModule, TranslateModule, BsDatepickerModule],
    selector: 'bey-form-date-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-date.component.html'
})
export class FormDateFieldComponent implements OnInit {
    @Input() field: FormDateField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<string | null>;
    readonly datepickerControl = new FormControl<Date | null>(null);
    datepickerConfig: FormDatepickerConfig = {
        dateInputFormat: DateFormatService.DEFAULT_FORMAT,
        returnFocusToInput: true,
        showWeekNumbers: false
    };

    sectionGroup?: FormGroup;

    private readonly datepickerLocaleService = inject(DatepickerLocaleService);
    private readonly dateFormatService = inject(DateFormatService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly formService = inject(FormService);
    private readonly translateService = inject(TranslateService);

    ngOnInit(): void {
        const initialLanguage = this.translateService.currentLang || this.translateService.getDefaultLang();

        this.datepickerConfig = this.createDatepickerConfig(this.field.format, initialLanguage);
        this.syncDatepickerLocale(initialLanguage);
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
            this.syncDatepickerLocale(event.lang);
        });

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                string | null
            >;

            this.syncDatepickerState();
            this.syncDatepickerValue(this.control.value);

            this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                this.syncDatepickerValue(value);
            });

            this.control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.syncDatepickerState();
            });

            this.datepickerControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                this.onDatepickerValueChange(value);
            });
        }
    }

    getMaxDate(): Date | undefined {
        return this.parseDate(this.field.maxDate) ?? undefined;
    }

    getMinDate(): Date | undefined {
        return this.parseDate(this.field.minDate) ?? undefined;
    }

    getPlaceholder(): string {
        return this.field.placeholder ?? this.field.format;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    markAsTouched(): void {
        this.control?.markAsTouched();
    }

    private areDatesEqual(firstDate: Date | null, secondDate: Date | null): boolean {
        return this.formatDate(firstDate) === this.formatDate(secondDate);
    }

    private formatDate(value: Date | null): string | null {
        return this.dateFormatService.formatDate(value, this.field.format);
    }

    private onDatepickerValueChange(value: Date | null): void {
        if (!this.control) {
            return;
        }

        const formattedValue = this.formatDate(value);

        if (this.control.value !== formattedValue) {
            this.control.setValue(formattedValue);
        }

        this.control.markAsDirty();
        this.control.markAsTouched();
    }

    private parseDate(value?: string | null): Date | null {
        return this.dateFormatService.parseDate(value, this.field.format);
    }

    private createDatepickerConfig(format: string, language?: string | null): FormDatepickerConfig {
        return {
            dateInputFormat: format,
            locale: this.datepickerLocaleService.getLocale(language),
            returnFocusToInput: true,
            showWeekNumbers: false
        };
    }

    private syncDatepickerLocale(language?: string | null): void {
        this.datepickerConfig = {
            ...this.datepickerConfig,
            locale: this.datepickerLocaleService.getLocale(language)
        };
        this.datepickerLocaleService.use(language);
    }

    private syncDatepickerState(): void {
        if (!this.control) {
            return;
        }

        if (this.control.disabled) {
            this.datepickerControl.disable({ emitEvent: false });

            return;
        }

        this.datepickerControl.enable({ emitEvent: false });
    }

    private syncDatepickerValue(value: string | null): void {
        const parsedValue = this.parseDate(value);

        if (this.areDatesEqual(this.datepickerControl.value, parsedValue)) {
            return;
        }

        this.datepickerControl.setValue(parsedValue, { emitEvent: false });
    }
}
