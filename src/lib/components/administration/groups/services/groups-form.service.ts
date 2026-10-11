import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ModalFormConfig, ModalFormSize } from '../../../form/components/modal/models/modal-form.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldOption } from '../../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import { PageOrganization } from '../../../page/models/page-organization.model';
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
    GROUPS_SEARCH_LIMIT,
    GROUPS_SEARCH_MAX_LIMIT,
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
        prefix,
        searchExtraRoles,
        searchMembers
    }: GroupEditOptions): ModalFormConfig<GroupEditFormValue> {
        return new ModalFormConfig<GroupEditFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: {
                [GROUPS_FORM_SECTION]: {
                    extraRoleIds: detail.extraRoles.map(({ id }) => id),
                    name: detail.name,
                    userIds: detail.members.map(({ id }) => id)
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
                                new FormListField({
                                    emptyKey: `${prefix}.form.main.user-ids.empty`,
                                    isRemovable: true,
                                    key: 'userIds',
                                    options: detail.members.map(toMemberOption),
                                    picker: {
                                        search: (text, chosenIds) =>
                                            searchUnchosen(searchMembers, text, chosenIds, toMemberOption)
                                    }
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormListField({
                                    emptyKey: `${prefix}.form.main.extra-role-ids.empty`,
                                    isRemovable: true,
                                    key: GROUPS_EXTRA_ROLES_FIELD,
                                    options: detail.extraRoles.map(toExtraRoleOption),
                                    picker: {
                                        search: (text, chosenIds) =>
                                            searchUnchosen(searchExtraRoles, text, chosenIds, toExtraRoleOption)
                                    }
                                })
                            ]
                        })
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

function searchUnchosen<T extends { id: string }>(
    search: (text: string, limit: number) => Observable<T[]>,
    text: string,
    chosenIds: string[],
    toOption: (item: T) => FormFieldOption
): Observable<FormFieldOption[]> {
    const chosen = new Set(chosenIds);
    const limit = Math.min(GROUPS_SEARCH_MAX_LIMIT, GROUPS_SEARCH_LIMIT + chosen.size);

    return search(text, limit).pipe(
        map(items =>
            items
                .filter(({ id }) => !chosen.has(id))
                .slice(0, GROUPS_SEARCH_LIMIT)
                .map(toOption)
        )
    );
}

function toCreateValue(organizationId: string | undefined): GroupFormValue | undefined {
    return organizationId ? { [GROUPS_FORM_SECTION]: { name: '', organizationId } } : undefined;
}

function toExtraRoleOption({ id, name }: GroupExtraRole): FormFieldOption {
    return { label: name, value: id };
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
