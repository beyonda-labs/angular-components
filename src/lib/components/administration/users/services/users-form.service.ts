import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PreferencesService } from '../../../../services/preferences/preferences.service';
import { FormCheckboxGroupField } from '../../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldOption, FormValue } from '../../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { hasOrganizationChoice } from '../../../page/functions/page-organization-filter';
import { PageFormConfig } from '../../../page/models/page-form.model';
import { PageOrganization } from '../../../page/models/page-organization.model';
import { userRoleLabel } from '../../functions/user-role-labels';
import {
    USER_STATUS_CHOICES,
    UserEditableField,
    UserExtraRole,
    UserFormFields,
    UserFormValue,
    UserOrganizationRole,
    UserRoles,
    UserRow,
    USERS_EXTRA_ROLES_FIELD,
    USERS_FORM_SECTION,
    UserSectionOptions,
    UsersFormOptions,
    UserStatus
} from '../models/users.model';

const TEXT_FIELDS = ['email', 'language', 'name', 'organizationId', 'surname'] as const;

@Injectable({
    providedIn: 'root'
})
export class UsersFormService {
    private readonly preferencesService = inject(PreferencesService);
    private readonly translateService = inject(TranslateService);

    buildFormConfig({
        extraRoles,
        isOrganizationAsked,
        organizations,
        prefix,
        rolePrefix,
        roles
    }: UsersFormOptions): PageFormConfig<UserFormValue, UserRow> {
        const organizationOptions = isOrganizationAsked ? toOptions(organizations) : null;
        const initialOrganizationId = organizationOptions?.length === 1 ? organizationOptions[0].value : undefined;

        return new PageFormConfig<UserFormValue, UserRow>({
            buildSections: user => [
                this.buildSection(user, {
                    extraRolesRows: buildExtraRolesRows(extraRoles, isOrganizationAsked, user),
                    organizationOptions,
                    prefix,
                    roleOptions: this.buildRoleOptions([...roles, ...(user?.roles ?? [])], rolePrefix)
                })
            ],
            prefix: `${prefix}.form`,
            toFormValue: user =>
                user
                    ? toEditValue(user, editChoices(extraRoles, isOrganizationAsked, user).length > 0)
                    : toInviteValue(initialOrganizationId),
            toItem: (value, user) => toUserRequest(value[USERS_FORM_SECTION], extraRoles, user)
        });
    }

    buildRoleFilterOptions(
        { extraRoles, roles }: UserRoles,
        rolePrefix: string,
        organizations: PageOrganization[]
    ): FormFieldOption[] {
        const organizationNames = hasOrganizationChoice(organizations)
            ? new Map(organizations.map(({ id, name }) => [id, name]))
            : null;

        return [
            ...this.buildRoleOptions(roles, rolePrefix),
            ...extraRoles.map(({ id, name, organizationId }) => {
                const organizationName = organizationNames?.get(organizationId);

                return { label: organizationName ? `${name} (${organizationName})` : name, value: id };
            })
        ];
    }

    buildRoleOptions(roles: string[], rolePrefix: string): FormFieldOption[] {
        return [...new Set(roles)].map(role => ({
            label: userRoleLabel(role, rolePrefix, key => this.translateService.instant(key) as string),
            value: role
        }));
    }

    private buildLanguageField(): FormSelectField {
        return new FormSelectField({
            key: 'language',
            options: this.preferencesService.languages.map(({ code, name }) => ({ label: name, value: code }))
        });
    }

    private buildSection(
        user: UserRow | undefined,
        { extraRolesRows, organizationOptions, prefix, roleOptions }: UserSectionOptions
    ): FormSection {
        return new FormSection({
            isTitleVisible: false,
            key: USERS_FORM_SECTION,
            rows: [
                new FormRow({
                    fields: [
                        user
                            ? new FormInfoField({ items: [{ label: user.email }], key: 'email' })
                            : new FormTextField({
                                  isRequired: true,
                                  key: 'email',
                                  validators: [new FormFieldEmailValidator()]
                              })
                    ]
                }),
                new FormRow({
                    fields: [
                        new FormTextField({
                            columns: 6,
                            isDisabled: isLocked(user, UserEditableField.Name),
                            key: 'name'
                        }),
                        new FormTextField({
                            columns: 6,
                            isDisabled: isLocked(user, UserEditableField.Surname),
                            key: 'surname'
                        })
                    ]
                }),
                ...(user?.editableFields
                    ? [
                          new FormRow({
                              fields: [
                                  new FormSelectField({
                                      columns: 6,
                                      isDisabled: isLocked(user, UserEditableField.Status),
                                      isRequired: true,
                                      key: 'status',
                                      options: toStatusOptions(user.status, prefix)
                                  })
                              ]
                          })
                      ]
                    : []),
                ...(!user && organizationOptions
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
                    : []),
                new FormRow({
                    fields: [
                        new FormCheckboxGroupField({
                            isDisabled: isLocked(user, UserEditableField.Roles),
                            isRequired: true,
                            key: 'roles',
                            options: roleOptions
                        })
                    ]
                }),
                ...extraRolesRows,
                ...(user ? [] : [new FormRow({ fields: [this.buildLanguageField()] })])
            ]
        });
    }
}

function buildExtraRolesRows(
    extraRoles: UserOrganizationRole[],
    isOrganizationAsked: boolean,
    user: UserRow | undefined
): FormRow[] {
    if (!user && isOrganizationAsked) {
        const optionsOf = (value: FormValue): FormFieldOption[] =>
            toExtraRoleOptions(
                extraRoles.filter(
                    ({ organizationId }) => organizationId === value[USERS_FORM_SECTION]?.['organizationId']
                )
            );

        return extraRoles.length > 0
            ? [
                  new FormRow({
                      fields: [
                          new FormCheckboxGroupField({
                              isHidden: value => optionsOf(value).length === 0,
                              key: USERS_EXTRA_ROLES_FIELD,
                              options: optionsOf
                          })
                      ]
                  })
              ]
            : [];
    }

    const choices = user ? editChoices(extraRoles, isOrganizationAsked, user) : extraRoles;

    return choices.length > 0
        ? [
              new FormRow({
                  fields: [
                      new FormCheckboxGroupField({
                          isDisabled: isLocked(user, UserEditableField.ExtraRoleIds),
                          key: USERS_EXTRA_ROLES_FIELD,
                          options: toExtraRoleOptions(choices)
                      })
                  ]
              })
          ]
        : [];
}

function editChoices(extraRoles: UserOrganizationRole[], isOrganizationAsked: boolean, user: UserRow): UserExtraRole[] {
    const offered = isOrganizationAsked
        ? extraRoles.filter(({ organizationId }) => organizationId === user.organizationId)
        : extraRoles;
    const held = (user.extraRoles ?? []).filter(role => !offered.some(({ id }) => id === role.id));

    return [...offered, ...held];
}

function inOrganization(
    extraRoleIds: string[],
    organizationId: string | undefined,
    extraRoles: UserOrganizationRole[]
): string[] {
    return organizationId
        ? extraRoleIds.filter(id => extraRoles.some(role => role.id === id && role.organizationId === organizationId))
        : extraRoleIds;
}

function isLocked(user: UserRow | undefined, field: UserEditableField): boolean {
    return user?.editableFields !== undefined && !user.editableFields.includes(field);
}

function onlyEditable(request: Partial<UserFormFields>, user: UserRow | undefined): Partial<UserFormFields> {
    const editableFields = user?.editableFields;

    return editableFields
        ? Object.fromEntries(
              Object.entries(request).filter(([key]) => editableFields.includes(key as UserEditableField))
          )
        : request;
}

function toEditValue(user: UserRow, hasExtraRoles: boolean): UserFormValue {
    return {
        [USERS_FORM_SECTION]: {
            name: user.name ?? '',
            roles: [...user.roles],
            surname: user.surname ?? '',
            ...(hasExtraRoles ? { extraRoleIds: (user.extraRoles ?? []).map(({ id }) => id) } : {}),
            ...(user.editableFields ? { status: user.status } : {})
        }
    };
}

function toExtraRoleOptions(roles: UserExtraRole[]): FormFieldOption[] {
    return roles.map(({ id, name }) => ({ label: name, value: id }));
}

function toInviteValue(organizationId: string | undefined): UserFormValue | undefined {
    return organizationId ? { [USERS_FORM_SECTION]: { organizationId, roles: [] } } : undefined;
}

function toOptions(organizations: PageOrganization[]): FormFieldOption[] {
    return organizations.map(({ id, name }) => ({ label: name, value: id }));
}

function toStatusOptions(status: UserStatus, prefix: string): FormFieldOption[] {
    return [...new Set([...USER_STATUS_CHOICES, status])].map(choice => ({
        label: `${prefix}.status.${choice}`,
        value: choice
    }));
}

function toUserRequest(
    fields: UserFormFields,
    extraRoles: UserOrganizationRole[],
    user: UserRow | undefined
): Partial<UserFormFields> {
    const texts = TEXT_FIELDS.map(key => [key, fields[key]?.trim() ?? ''] as const).filter(([, value]) => value);
    const { extraRoleIds, organizationId, status } = fields;

    return onlyEditable(
        {
            ...Object.fromEntries(texts),
            roles: fields.roles,
            ...(extraRoleIds ? { extraRoleIds: inOrganization(extraRoleIds, organizationId, extraRoles) } : {}),
            ...(user && status && status !== user.status ? { status } : {})
        },
        user
    );
}
