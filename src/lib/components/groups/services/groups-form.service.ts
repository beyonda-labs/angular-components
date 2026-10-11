import { Injectable } from '@angular/core';

import { ModalFormConfig, ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption } from '../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import {
    GROUP_NAME_MAX_LENGTH,
    GroupEditFormValue,
    GroupEditOptions,
    GroupExtraRole,
    GroupFields,
    GroupFormValue,
    GroupMember,
    GroupRow,
    GROUPS_EXTRA_ROLES_FIELD,
    GROUPS_FORM_SECTION,
    GroupsFormOptions
} from '../models/groups.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class GroupsFormService {
    buildEditFormConfig({
        detail,
        memberOptions,
        prefix,
        roleOptions
    }: GroupEditOptions): ModalFormConfig<GroupEditFormValue> {
        const members = withHeld(memberOptions, detail.members);
        const extraRoles = withHeld(roleOptions, detail.extraRoles);

        return new ModalFormConfig<GroupEditFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: {
                [GROUPS_FORM_SECTION]: {
                    name: detail.name,
                    userIds: detail.members.map(({ id }) => id),
                    ...(extraRoles.length > 0
                        ? { [GROUPS_EXTRA_ROLES_FIELD]: detail.extraRoles.map(({ id }) => id) }
                        : {})
                }
            },
            prefix: `${prefix}.form`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: GROUPS_FORM_SECTION,
                    rows: [
                        new FormRow({ fields: [buildNameField()] }),
                        new FormRow({
                            fields: [
                                new FormCheckboxGroupField({
                                    hint: members.length > 0 ? undefined : `${prefix}.form.main.user-ids.empty`,
                                    key: 'userIds',
                                    options: members.map(toMemberOption)
                                })
                            ]
                        }),
                        ...(extraRoles.length > 0
                            ? [
                                  new FormRow({
                                      fields: [
                                          new FormCheckboxGroupField({
                                              key: GROUPS_EXTRA_ROLES_FIELD,
                                              options: extraRoles.map(({ id, name }) => ({ label: name, value: id }))
                                          })
                                      ]
                                  })
                              ]
                            : [])
                    ]
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: SUBMIT_LABEL_KEY,
            title: `${prefix}.form.edit.title`
        });
    }

    buildFormConfig({
        isOrganizationAsked,
        organizations,
        prefix
    }: GroupsFormOptions): PageFormConfig<GroupFormValue, GroupRow> {
        const organizationOptions = isOrganizationAsked ? toOrganizationOptions(organizations) : null;
        const initialOrganizationId = organizationOptions?.length === 1 ? organizationOptions[0].value : undefined;

        return new PageFormConfig<GroupFormValue, GroupRow>({
            buildSections: () => [
                new FormSection({
                    isTitleVisible: false,
                    key: GROUPS_FORM_SECTION,
                    rows: [
                        new FormRow({ fields: [buildNameField()] }),
                        ...(organizationOptions
                            ? [
                                  new FormRow({
                                      fields: [
                                          new FormSelectField({
                                              isRequired: true,
                                              key: 'organizationId',
                                              options: organizationOptions
                                          })
                                      ]
                                  })
                              ]
                            : [])
                    ]
                })
            ],
            prefix: `${prefix}.form`,
            size: ModalFormSize.Medium,
            toFormValue: () => toCreateValue(initialOrganizationId),
            toItem: value => toGroupRequest(value[GROUPS_FORM_SECTION])
        });
    }
}

function buildNameField(): FormTextField {
    return new FormTextField({
        isRequired: true,
        key: 'name',
        validators: [new FormFieldLengthValidator(GROUP_NAME_MAX_LENGTH, FormFieldValidatorType.MaxLength)]
    });
}

function toCreateValue(organizationId: string | undefined): GroupFormValue | undefined {
    return organizationId ? { [GROUPS_FORM_SECTION]: { name: '', organizationId } } : undefined;
}

function toGroupRequest({ name, organizationId }: GroupFields): GroupFields {
    return { name: name.trim(), ...(organizationId ? { organizationId } : {}) };
}

function toMemberOption({ email, id, name }: GroupMember): FormFieldOption {
    return { label: name && name !== email ? `${name} (${email})` : email, value: id };
}

function toOrganizationOptions(organizations: PageOrganization[]): FormFieldOption[] {
    return organizations.map(({ id, name }) => ({ label: name, value: id }));
}

function withHeld<T extends GroupExtraRole | GroupMember>(options: T[], held: T[]): T[] {
    return [...options, ...held.filter(item => !options.some(({ id }) => id === item.id))];
}
