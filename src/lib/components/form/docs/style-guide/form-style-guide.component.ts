import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { ModalFormConfig } from '../../components/modal/models/modal-form.model';
import { ModalFormService } from '../../components/modal/services/modal-form.service';
import { FormComponent } from '../../form.component';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../models/form.model';
import { buildStyleGuideSections } from './form-style-guide.sections';

@Component({
    imports: [ButtonComponent, FormComponent, TranslateModule],
    selector: 'bey-form-style-guide',
    standalone: true,
    templateUrl: './form-style-guide.component.html'
})
export class FormStyleGuideComponent {
    config: FormConfig;

    private readonly modalFormService = inject(ModalFormService);
    private readonly translateService = inject(TranslateService);

    get modalFormButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.openModalForm(),
            label: 'angular-components-style-guide.form.modal.open',
            type: ButtonType.Primary
        });
    }

    openModalForm(): void {
        this.modalFormService.open(
            new ModalFormConfig({
                i18nPrefix: 'angular-components-style-guide.form.modal',
                initialValue: {
                    contact: {
                        email: '',
                        name: 'Beyonda'
                    }
                },
                onSubmit: (currentValue, form) => {
                    const formSubmittedMessage = this.translateService.instant(
                        'angular-components-style-guide.form.modal.submitted'
                    );

                    // eslint-disable-next-line no-console
                    console.log(formSubmittedMessage, currentValue);
                    form.close();
                },
                sections: [
                    new FormSection({
                        key: 'contact',
                        rows: [
                            new FormRow({
                                fields: [
                                    new FormTextField({
                                        key: 'name',
                                        columns: 6,
                                        isRequired: true
                                    }),
                                    new FormTextField({
                                        key: 'email',
                                        columns: 6,
                                        isRequired: true
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        );
    }

    constructor() {
        this.config = new FormConfig({
            i18nPrefix: 'angular-components-style-guide.form',
            sections: buildStyleGuideSections(),
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
                        checkbox3: true,
                        checkbox4: false
                    },
                    sectionChips: {
                        chips1: [],
                        chips2: [],
                        chips3: ['Angular', 'TypeScript']
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
