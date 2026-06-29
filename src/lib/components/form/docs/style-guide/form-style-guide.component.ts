import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormComponent } from '../../form.component';
import { FormCheckboxField } from '../../models/fields/form-checkbox-field.model';
import { FormDateField } from '../../models/fields/form-date-field.model';
import { FormNumberField } from '../../models/fields/form-number-field.model';
import { FormPasswordField } from '../../models/fields/form-password-field.model';
import { FormRadioField } from '../../models/fields/form-radio-field.model';
import { FormSelectField } from '../../models/fields/form-select-field.model';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormTextareaField } from '../../models/fields/form-textarea-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../models/form.model';
import { FormFieldPatternValidator } from '../../models/form-field-validator.model';

@Component({
    imports: [FormComponent, TranslateModule],
    selector: 'bey-form-style-guide',
    standalone: true,
    templateUrl: './form-style-guide.component.html'
})
export class FormStyleGuideComponent {
    config: FormConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.config = new FormConfig({
            i18nPrefix: 'angular-components-style-guide.form',
            sections: [
                new FormSection({
                    key: 'sectionText',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    key: 'text1',
                                    isRequired: true,
                                    isLabelTooltipVisible: true
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    key: 'text2',
                                    isLabelTooltipVisible: true,
                                    columns: 6
                                }),
                                new FormTextField({
                                    key: 'text3',
                                    columns: 6,
                                    validators: [new FormFieldPatternValidator(/^[A-Za-z]+$/u)]
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    key: 'text4',
                                    columns: 4,
                                    isDisabled: true
                                }),
                                new FormTextField({
                                    key: 'text5',
                                    columns: 8
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionPassword',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    key: 'password1',
                                    columns: 6
                                }),
                                new FormPasswordField({
                                    key: 'password2',
                                    columns: 6,
                                    isRequired: true
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    key: 'password3',
                                    columns: 6,
                                    isDisabled: true
                                }),
                                new FormPasswordField({
                                    key: 'password4',
                                    columns: 6,
                                    showToggle: false
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionDate',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormDateField({
                                    key: 'date1',
                                    columns: 6,
                                    minDate: '2026-01-01',
                                    maxDate: '2026-12-31'
                                }),
                                new FormDateField({
                                    key: 'date2',
                                    columns: 6,
                                    isRequired: true
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormDateField({
                                    key: 'date3',
                                    columns: 6,
                                    isDisabled: true
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionNumber',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormNumberField({
                                    key: 'number1',
                                    columns: 6,
                                    min: 1,
                                    max: 100
                                }),
                                new FormNumberField({
                                    key: 'number2',
                                    columns: 6,
                                    isRequired: true
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormNumberField({
                                    key: 'number3',
                                    columns: 6,
                                    isDisabled: true
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionSelect',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormSelectField({
                                    key: 'select1',
                                    columns: 6,
                                    options: [
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select1.options.option1',
                                            value: 'option1'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select1.options.option2',
                                            value: 'option2'
                                        }
                                    ]
                                }),
                                new FormSelectField({
                                    key: 'select2',
                                    columns: 6,
                                    isRequired: true,
                                    options: [
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select2.options.option1',
                                            value: 'option1'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select2.options.option2',
                                            value: 'option2'
                                        }
                                    ]
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormSelectField({
                                    key: 'select3',
                                    columns: 6,
                                    isDisabled: true,
                                    options: [
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select3.options.option1',
                                            value: 'option1'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionSelect.select3.options.option2',
                                            value: 'option2'
                                        }
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionRadio',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormRadioField({
                                    key: 'radio1',
                                    columns: 6,
                                    options: [
                                        {
                                            label: 'angular-components-style-guide.form.sectionRadio.radio1.options.option1',
                                            value: 'option1'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionRadio.radio1.options.option2',
                                            value: 'option2'
                                        }
                                    ]
                                }),
                                new FormRadioField({
                                    key: 'radio2',
                                    columns: 6,
                                    isRequired: true,
                                    options: [
                                        {
                                            label: 'angular-components-style-guide.form.sectionRadio.radio2.options.option1',
                                            value: 'option1'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionRadio.radio2.options.option2',
                                            value: 'option2'
                                        },
                                        {
                                            label: 'angular-components-style-guide.form.sectionRadio.radio2.options.option3',
                                            value: 'option3',
                                            isDisabled: true
                                        }
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionTextarea',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextareaField({
                                    key: 'textarea1',
                                    columns: 8,
                                    rows: 4,
                                    maxHeight: '160px'
                                }),
                                new FormTextareaField({
                                    key: 'textarea2',
                                    columns: 4,
                                    rows: 2,
                                    isRequired: true
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextareaField({
                                    key: 'textarea3',
                                    columns: 6,
                                    isDisabled: true,
                                    rows: 3
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: 'sectionCheckbox',
                    isTooltipVisible: true,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormCheckboxField({
                                    key: 'checkbox1',
                                    columns: 4
                                }),
                                new FormCheckboxField({
                                    key: 'checkbox2',
                                    columns: 4,
                                    isRequired: true
                                }),
                                new FormCheckboxField({
                                    key: 'checkbox3',
                                    columns: 4,
                                    isDisabled: true
                                })
                            ]
                        })
                    ]
                })
            ],
            buttons: [
                new FormButton({
                    label: 'angular-components-style-guide.form.button.cancel',
                    type: FormButtonType.Cancel
                }),
                new FormButton({
                    label: 'angular-components-style-guide.form.button.submit',
                    type: FormButtonType.Submit
                })
            ],
            onValueChange: currentValue => {
                const formChangedMessage = this.translateService.instant('angular-components-style-guide.form.changed');

                // eslint-disable-next-line no-console
                console.log(formChangedMessage, currentValue);
            },
            onFormGroupAdded: (formGroup, form) => {
                form.setInitialValue({
                    sectionText: {
                        text1: '',
                        text2: '',
                        text3: '',
                        text4: 'Disabled value',
                        text5: ''
                    },
                    sectionPassword: {
                        password1: '',
                        password2: '',
                        password3: 'disabledpass',
                        password4: ''
                    },
                    sectionDate: {
                        date1: '',
                        date2: '',
                        date3: '2026-06-15'
                    },
                    sectionNumber: {
                        number1: null,
                        number2: null,
                        number3: 25
                    },
                    sectionSelect: {
                        select1: '',
                        select2: '',
                        select3: 'option1'
                    },
                    sectionRadio: {
                        radio1: '',
                        radio2: ''
                    },
                    sectionTextarea: {
                        textarea1: '',
                        textarea2: '',
                        textarea3: 'Disabled long text'
                    },
                    sectionCheckbox: {
                        checkbox1: false,
                        checkbox2: false,
                        checkbox3: true
                    }
                });
            },
            onCancel: () => {
                const formChangedMessage = this.translateService.instant(
                    'angular-components-style-guide.form.canceled'
                );

                // eslint-disable-next-line no-console
                console.log(formChangedMessage);
            },
            onSubmit: currentValue => {
                const formChangedMessage = this.translateService.instant(
                    'angular-components-style-guide.form.submitted'
                );

                // eslint-disable-next-line no-console
                console.log(formChangedMessage, currentValue);
            }
        });
    }
}
