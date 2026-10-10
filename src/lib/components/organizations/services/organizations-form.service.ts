import { inject, Injectable } from '@angular/core';

import { PreferencesService } from '../../../services/preferences/preferences.service';
import { ModalFormConfig, ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import {
    FormFieldEmailValidator,
    FormFieldLengthValidator,
    FormFieldValidatorType
} from '../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import {
    ORGANIZATION_NAME_MAX_LENGTH,
    OrganizationAdminFormValue,
    OrganizationFormValue,
    OrganizationRow,
    ORGANIZATIONS_FORM_SECTION
} from '../models/organizations.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsFormService {
    private readonly preferencesService = inject(PreferencesService);

    buildFormConfig(prefix: string): PageFormConfig<OrganizationFormValue, OrganizationRow> {
        return new PageFormConfig<OrganizationFormValue, OrganizationRow>({
            buildSections: () => [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    isRequired: true,
                                    key: 'name',
                                    validators: [
                                        new FormFieldLengthValidator(
                                            ORGANIZATION_NAME_MAX_LENGTH,
                                            FormFieldValidatorType.MaxLength
                                        )
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ],
            prefix: `${prefix}.form`,
            size: ModalFormSize.Medium,
            toFormValue: organization =>
                organization ? { [ORGANIZATIONS_FORM_SECTION]: { name: organization.name } } : undefined,
            toItem: value => ({ name: value[ORGANIZATIONS_FORM_SECTION].name.trim() })
        });
    }

    buildInviteAdminFormConfig(
        prefix: string,
        organization: OrganizationRow
    ): ModalFormConfig<OrganizationAdminFormValue> {
        return new ModalFormConfig<OrganizationAdminFormValue>({
            prefix: `${prefix}.invite-admin`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [new FormInfoField({ items: [{ label: organization.name }], key: 'organization' })]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    isRequired: true,
                                    key: 'email',
                                    validators: [new FormFieldEmailValidator()]
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({ columns: 6, key: 'name' }),
                                new FormTextField({ columns: 6, key: 'surname' })
                            ]
                        }),
                        new FormRow({ fields: [this.buildLanguageField()] })
                    ]
                })
            ]
        });
    }

    private buildLanguageField(): FormSelectField {
        return new FormSelectField({
            key: 'language',
            options: this.preferencesService.languages.map(({ code, name }) => ({ label: name, value: code }))
        });
    }
}
