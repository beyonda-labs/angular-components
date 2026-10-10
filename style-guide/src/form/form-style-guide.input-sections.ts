import {
    BeyFormDateField,
    BeyFormFieldLengthValidator,
    BeyFormFieldPatternValidator,
    BeyFormFieldValidatorType,
    BeyFormInfoField,
    BeyFormListField,
    BeyFormNumberField,
    BeyFormPasswordField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyPasswordPolicy
} from '@beyonda-labs/angular-components';
import { faCalendarDays, faUser } from '@fortawesome/free-solid-svg-icons';

const PREFIX = 'angular-components-style-guide.form';
const STRICT_POLICY = new BeyPasswordPolicy({
    isDigitRequired: true,
    isLowercaseRequired: true,
    isSymbolRequired: true,
    isUppercaseRequired: true
});

export function buildInputSections(): BeyFormSection[] {
    return [
        new BeyFormSection({
            key: 'section-text',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({
                            key: 'text1',
                            isRequired: true,
                            isLabelTooltipVisible: true
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({
                            key: 'text2',
                            isLabelTooltipVisible: true,
                            columns: 6
                        }),
                        new BeyFormTextField({
                            key: 'text3',
                            columns: 6,
                            hint: `${PREFIX}.section-text.text3.hint`,
                            validators: [new BeyFormFieldPatternValidator(/^[A-Za-z]+$/u)]
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({
                            key: 'text4',
                            columns: 4,
                            isDisabled: true
                        }),
                        new BeyFormTextField({
                            key: 'text5',
                            columns: 8
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-password',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormPasswordField({
                            key: 'password1',
                            columns: 6,
                            hint: `${PREFIX}.section-password.password1.hint`,
                            validators: [new BeyFormFieldLengthValidator(8, BeyFormFieldValidatorType.MinLength)]
                        }),
                        new BeyFormPasswordField({
                            key: 'password2',
                            columns: 6,
                            isRequired: true
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormPasswordField({
                            key: 'password3',
                            columns: 6,
                            isDisabled: true
                        }),
                        new BeyFormPasswordField({
                            key: 'password4',
                            columns: 6,
                            showToggle: false
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormPasswordField({
                            key: 'password5',
                            autocomplete: 'new-password',
                            columns: 6,
                            isRequired: true,
                            policy: STRICT_POLICY
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-date',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormDateField({
                            key: 'date1',
                            columns: 6,
                            minDate: '2026-01-01',
                            maxDate: '2026-12-31'
                        }),
                        new BeyFormDateField({
                            key: 'date2',
                            columns: 6,
                            isRequired: true
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormDateField({
                            key: 'date3',
                            columns: 6,
                            isDisabled: true
                        })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-info',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormInfoField({
                            key: 'info1',
                            columns: 6,
                            hint: `${PREFIX}.section-info.info1.hint`,
                            items: [{ label: '1.0' }]
                        }),
                        new BeyFormInfoField({
                            key: 'info2',
                            columns: 6,
                            items: [
                                { icon: faCalendarDays, label: '24 Jul 2026' },
                                { icon: faUser, label: 'Admin Admin' }
                            ]
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormListField({
                            key: 'list1',
                            columns: 6,
                            items: Array.from({ length: 12 }, (_, index) => `Template ${index + 1}`)
                        }),
                        new BeyFormListField({ key: 'list2', columns: 6 })
                    ]
                })
            ]
        }),
        new BeyFormSection({
            key: 'section-number',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormNumberField({
                            key: 'number1',
                            columns: 6,
                            min: 1,
                            max: 100
                        }),
                        new BeyFormNumberField({
                            key: 'number2',
                            columns: 6,
                            isRequired: true
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormNumberField({
                            key: 'number3',
                            columns: 6,
                            isDisabled: true
                        })
                    ]
                })
            ]
        })
    ];
}
