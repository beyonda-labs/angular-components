import { Injectable } from '@angular/core';

import { ModalFormConfig, ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption } from '../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import {
    GROUP_NAME_MAX_LENGTH,
    GroupFields,
    GroupFormValue,
    GroupMember,
    GroupMembersFormValue,
    GroupRow,
    GROUPS_FORM_SECTION,
    GroupsFormOptions
} from '../models/groups.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsFormService {
    buildFormConfig({
        isOrganizationAsked,
        organizations,
        prefix
    }: GroupsFormOptions): PageFormConfig<GroupFormValue, GroupRow> {
        const organizationOptions = isOrganizationAsked ? toOrganizationOptions(organizations) : null;
        const initialOrganizationId = organizationOptions?.length === 1 ? organizationOptions[0].value : undefined;

        return new PageFormConfig<GroupFormValue, GroupRow>({
            buildSections: group => [
                new FormSection({
                    isTitleVisible: false,
                    key: GROUPS_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    isRequired: true,
                                    key: 'name',
                                    validators: [
                                        new FormFieldLengthValidator(
                                            GROUP_NAME_MAX_LENGTH,
                                            FormFieldValidatorType.MaxLength
                                        )
                                    ]
                                })
                            ]
                        }),
                        ...(!group && organizationOptions
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
            toFormValue: group => (group ? toEditValue(group) : toCreateValue(initialOrganizationId)),
            toItem: value => toGroupRequest(value[GROUPS_FORM_SECTION])
        });
    }

    buildMembersFormConfig(
        prefix: string,
        group: GroupRow,
        options: GroupMember[],
        members: GroupMember[]
    ): ModalFormConfig<GroupMembersFormValue> {
        const choices = [...options, ...members.filter(member => !options.some(({ id }) => id === member.id))];

        return new ModalFormConfig<GroupMembersFormValue>({
            initialValue: { [GROUPS_FORM_SECTION]: { userIds: members.map(({ id }) => id) } },
            prefix: `${prefix}.members`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: GROUPS_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [new FormInfoField({ items: [{ label: group.name }], key: 'group' })]
                        }),
                        new FormRow({
                            fields: [
                                new FormCheckboxGroupField({
                                    hint: choices.length > 0 ? undefined : `${prefix}.members.main.user-ids.empty`,
                                    key: 'userIds',
                                    options: choices.map(toMemberOption)
                                })
                            ]
                        })
                    ]
                })
            ],
            size: ModalFormSize.Medium
        });
    }
}

function toCreateValue(organizationId: string | undefined): GroupFormValue | undefined {
    return organizationId ? { [GROUPS_FORM_SECTION]: { name: '', organizationId } } : undefined;
}

function toEditValue(group: GroupRow): GroupFormValue {
    return { [GROUPS_FORM_SECTION]: { name: group.name } };
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
