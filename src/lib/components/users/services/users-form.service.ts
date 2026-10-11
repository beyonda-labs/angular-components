import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PreferencesService } from '../../../services/preferences/preferences.service';
import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption } from '../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { userRoleLabel } from '../functions/user-labels';
import { UserFormFields, UserFormValue, UserRow, USERS_FORM_SECTION, UsersFormOptions } from '../models/users.model';

const TEXT_FIELDS = ['email', 'language', 'name', 'organizationId', 'surname'] as const;

@Injectable({
    providedIn: 'root'
})
export class UsersFormService {
    private readonly preferencesService = inject(PreferencesService);
    private readonly translateService = inject(TranslateService);

    buildFormConfig({
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
                this.buildSection(
                    user,
                    this.buildRoleOptions([...roles, ...(user?.roles ?? [])], rolePrefix),
                    organizationOptions
                )
            ],
            prefix: `${prefix}.form`,
            toFormValue: user => (user ? toEditValue(user) : toInviteValue(initialOrganizationId)),
            toItem: value => toUserRequest(value[USERS_FORM_SECTION])
        });
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
        roleOptions: FormFieldOption[],
        organizationOptions: FormFieldOption[] | null
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
                        new FormTextField({ columns: 6, key: 'name' }),
                        new FormTextField({ columns: 6, key: 'surname' })
                    ]
                }),
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
                    fields: [new FormCheckboxGroupField({ isRequired: true, key: 'roles', options: roleOptions })]
                }),
                ...(user ? [] : [new FormRow({ fields: [this.buildLanguageField()] })])
            ]
        });
    }
}

function toEditValue(user: UserRow): UserFormValue {
    return { [USERS_FORM_SECTION]: { name: user.name ?? '', roles: [...user.roles], surname: user.surname ?? '' } };
}

function toInviteValue(organizationId: string | undefined): UserFormValue | undefined {
    return organizationId ? { [USERS_FORM_SECTION]: { organizationId, roles: [] } } : undefined;
}

function toOptions(organizations: PageOrganization[]): FormFieldOption[] {
    return organizations.map(({ id, name }) => ({ label: name, value: id }));
}

function toUserRequest(fields: UserFormFields): Partial<UserFormFields> {
    const texts = TEXT_FIELDS.map(key => [key, fields[key]?.trim() ?? ''] as const).filter(([, value]) => value);

    return { ...Object.fromEntries(texts), roles: fields.roles };
}
