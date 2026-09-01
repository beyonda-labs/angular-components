import { faCalendarDays, faUser } from '@fortawesome/free-solid-svg-icons';

import { FormAutocompleteField } from '../../models/fields/form-autocomplete-field.model';
import { FormCheckboxField } from '../../models/fields/form-checkbox-field.model';
import { FormChipsField } from '../../models/fields/form-chips-field.model';
import { FormDateField } from '../../models/fields/form-date-field.model';
import { FormInfoField } from '../../models/fields/form-info-field.model';
import { FormNumberField } from '../../models/fields/form-number-field.model';
import { FormPasswordField } from '../../models/fields/form-password-field.model';
import { FormRadioField } from '../../models/fields/form-radio-field.model';
import { FormSelectField } from '../../models/fields/form-select-field.model';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormTextareaField } from '../../models/fields/form-textarea-field.model';
import { FormRow, FormSection } from '../../models/form.model';
import { FormFieldOption } from '../../models/form-field.model';
import { FormFieldPatternValidator } from '../../models/form-field-validator.model';

export function buildStyleGuideSections(): FormSection[] {
    return [
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
            key: 'sectionInfo',
            isTooltipVisible: true,
            rows: [
                new FormRow({
                    fields: [
                        new FormInfoField({
                            key: 'info1',
                            columns: 6,
                            items: [{ label: '1.0' }]
                        }),
                        new FormInfoField({
                            key: 'info2',
                            columns: 6,
                            items: [
                                { icon: faCalendarDays, label: '24 Jul 2026' },
                                { icon: faUser, label: 'Admin Admin' }
                            ]
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
            key: 'sectionAutocomplete',
            isTooltipVisible: true,
            rows: [
                new FormRow({
                    fields: [
                        new FormAutocompleteField({
                            key: 'autocomplete1',
                            columns: 6,
                            options: buildAutocompleteOptions('autocomplete1')
                        }),
                        new FormAutocompleteField({
                            key: 'autocomplete2',
                            columns: 6,
                            isRequired: true,
                            options: buildAutocompleteOptions('autocomplete2')
                        })
                    ]
                }),
                new FormRow({
                    fields: [
                        new FormAutocompleteField({
                            key: 'autocomplete3',
                            columns: 6,
                            isDisabled: true,
                            options: buildAutocompleteOptions('autocomplete3')
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
                        }),
                        new FormCheckboxField({
                            key: 'checkbox4',
                            columns: 4,
                            isSwitch: true
                        })
                    ]
                })
            ]
        }),
        new FormSection({
            key: 'sectionChips',
            isTooltipVisible: true,
            rows: [
                new FormRow({
                    fields: [
                        new FormChipsField({
                            key: 'chips1',
                            columns: 4
                        }),
                        new FormChipsField({
                            key: 'chips2',
                            columns: 4,
                            isRequired: true,
                            maxItems: 5
                        }),
                        new FormChipsField({
                            key: 'chips3',
                            columns: 4,
                            isDisabled: true
                        })
                    ]
                })
            ]
        })
    ];
}

function buildAutocompleteOptions(fieldKey: string): FormFieldOption[] {
    const prefix = `angular-components-style-guide.form.sectionAutocomplete.${fieldKey}.options`;

    return ['option1', 'option2', 'option3', 'option4'].map(option => ({
        label: `${prefix}.${option}`,
        value: option
    }));
}
