import {
    BeyFormAutocompleteField,
    BeyFormCheckboxField,
    BeyFormChipsField,
    BeyFormFieldCustomValidator,
    BeyFormFieldOption,
    BeyFormRadioField,
    BeyFormRow,
    BeyFormSection,
    BeyFormSelectField,
    BeyFormTextareaField
} from '@beyonda-labs/angular-components';

export function buildChoiceSections(): BeyFormSection[] {
    return [
        new BeyFormSection({
            key: 'section-select',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormSelectField({
                            key: 'select1',
                            columns: 6,
                            options: [
                                {
                                    label: 'angular-components-style-guide.form.section-select.select1.options.option1',
                                    value: 'option1'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-select.select1.options.option2',
                                    value: 'option2'
                                }
                            ]
                        }),
                        new BeyFormSelectField({
                            key: 'select2',
                            columns: 6,
                            isRequired: true,
                            options: [
                                {
                                    label: 'angular-components-style-guide.form.section-select.select2.options.option1',
                                    value: 'option1'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-select.select2.options.option2',
                                    value: 'option2'
                                }
                            ]
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormSelectField({
                            key: 'select3',
                            columns: 6,
                            isDisabled: true,
                            options: [
                                {
                                    label: 'angular-components-style-guide.form.section-select.select3.options.option1',
                                    value: 'option1'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-select.select3.options.option2',
                                    value: 'option2'
                                }
                            ]
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-autocomplete',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormAutocompleteField({
                            key: 'autocomplete1',
                            columns: 6,
                            options: buildAutocompleteOptions('autocomplete1')
                        }),
                        new BeyFormAutocompleteField({
                            key: 'autocomplete2',
                            columns: 6,
                            isRequired: true,
                            options: buildAutocompleteOptions('autocomplete2')
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormAutocompleteField({
                            key: 'autocomplete3',
                            columns: 6,
                            isDisabled: true,
                            options: buildAutocompleteOptions('autocomplete3')
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-radio',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormRadioField({
                            key: 'radio1',
                            columns: 6,
                            options: [
                                {
                                    label: 'angular-components-style-guide.form.section-radio.radio1.options.option1',
                                    value: 'option1'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-radio.radio1.options.option2',
                                    value: 'option2'
                                }
                            ]
                        }),
                        new BeyFormRadioField({
                            key: 'radio2',
                            columns: 6,
                            isRequired: true,
                            options: [
                                {
                                    label: 'angular-components-style-guide.form.section-radio.radio2.options.option1',
                                    value: 'option1'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-radio.radio2.options.option2',
                                    value: 'option2'
                                },
                                {
                                    label: 'angular-components-style-guide.form.section-radio.radio2.options.option3',
                                    value: 'option3',
                                    isDisabled: true
                                }
                            ]
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-textarea',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormTextareaField({
                            key: 'textarea1',
                            columns: 8,
                            rows: 4,
                            maxHeight: '160px'
                        }),
                        new BeyFormTextareaField({
                            key: 'textarea2',
                            columns: 4,
                            rows: 2,
                            isRequired: true
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormTextareaField({
                            key: 'textarea3',
                            columns: 6,
                            isDisabled: true,
                            rows: 3
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-checkbox',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormCheckboxField({
                            key: 'checkbox1',
                            columns: 4
                        }),
                        new BeyFormCheckboxField({
                            key: 'checkbox2',
                            columns: 4,
                            isRequired: true
                        }),
                        new BeyFormCheckboxField({
                            key: 'checkbox3',
                            columns: 4,
                            isDisabled: true
                        }),
                        new BeyFormCheckboxField({
                            key: 'checkbox4',
                            columns: 4,
                            isSwitch: true
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-chips',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormChipsField({
                            key: 'chips1',
                            columns: 4,
                            validators: [
                                new BeyFormFieldCustomValidator(control =>
                                    ((control.value as string[] | null) ?? []).some(tag => tag !== tag.toLowerCase())
                                        ? { lowercase: true }
                                        : null
                                )
                            ]
                        }),
                        new BeyFormChipsField({
                            key: 'chips2',
                            columns: 4,
                            isRequired: true,
                            maxItems: 5
                        }),
                        new BeyFormChipsField({
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

function buildAutocompleteOptions(fieldKey: string): BeyFormFieldOption[] {
    const prefix = `angular-components-style-guide.form.section-autocomplete.${fieldKey}.options`;

    return ['option1', 'option2', 'option3', 'option4'].map(option => ({
        label: `${prefix}.${option}`,
        value: option
    }));
}
