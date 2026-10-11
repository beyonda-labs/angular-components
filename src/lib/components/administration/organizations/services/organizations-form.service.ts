import { Injectable } from '@angular/core';

import { ModalFormConfig, ModalFormSize } from '../../../form/components/modal/models/modal-form.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import {
    ORGANIZATION_NAME_MAX_LENGTH,
    OrganizationDetail,
    OrganizationEditFormValue,
    OrganizationFormValue,
    OrganizationGroup,
    OrganizationGroupMember,
    OrganizationRow,
    ORGANIZATIONS_FORM_SECTION,
    ORGANIZATIONS_GROUPS_SECTION,
    OrganizationStatus
} from '../models/organizations.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsFormService {
    buildEditFormConfig(prefix: string, organization: OrganizationDetail): ModalFormConfig<OrganizationEditFormValue> {
        return new ModalFormConfig<OrganizationEditFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: { [ORGANIZATIONS_FORM_SECTION]: { name: organization.name, status: organization.status } },
            prefix: `${prefix}.form`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [
                        new FormRow({ fields: [buildNameField()] }),
                        new FormRow({
                            fields: [
                                new FormSelectField({
                                    columns: 6,
                                    isRequired: true,
                                    key: 'status',
                                    options: Object.values(OrganizationStatus).map(status => ({
                                        label: `${prefix}.status.${status}`,
                                        value: status
                                    }))
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    key: ORGANIZATIONS_GROUPS_SECTION,
                    rows: buildGroupRows(organization.groups, `${prefix}.form.${ORGANIZATIONS_GROUPS_SECTION}`)
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: SUBMIT_LABEL_KEY,
            title: `${prefix}.form.edit.title`
        });
    }

    buildFormConfig(prefix: string): PageFormConfig<OrganizationFormValue, OrganizationRow> {
        return new PageFormConfig<OrganizationFormValue, OrganizationRow>({
            buildSections: () => [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [new FormRow({ fields: [buildNameField()] })]
                })
            ],
            prefix: `${prefix}.form`,
            size: ModalFormSize.Medium,
            toItem: value => ({ name: value[ORGANIZATIONS_FORM_SECTION].name.trim() })
        });
    }
}

function buildGroupRows(groups: OrganizationGroup[], groupsPrefix: string): FormRow[] {
    if (groups.length === 0) {
        return [
            new FormRow({
                fields: [
                    new FormListField({ isLabelVisible: false, key: 'empty', placeholder: `${groupsPrefix}.empty` })
                ]
            })
        ];
    }

    return groups.map(
        ({ id, members, name }) =>
            new FormRow({
                fields: [
                    new FormListField({
                        items: members.map(toMemberLabel),
                        key: id,
                        label: name,
                        placeholder: `${groupsPrefix}.no-members`
                    })
                ]
            })
    );
}

function buildNameField(): FormTextField {
    return new FormTextField({
        isRequired: true,
        key: 'name',
        validators: [new FormFieldLengthValidator(ORGANIZATION_NAME_MAX_LENGTH, FormFieldValidatorType.MaxLength)]
    });
}

function toMemberLabel({ email, name }: OrganizationGroupMember): string {
    return name && name !== email ? `${name} (${email})` : email;
}
