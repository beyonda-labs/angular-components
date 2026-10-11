import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormTextareaField } from '../../form/models/fields/form-textarea-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption, FormValue } from '../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { roleLabel } from '../functions/role-labels';
import {
    groupRolePermissions,
    rolePermissionGroupLabel,
    rolePermissionLabel,
    toRolePermissions
} from '../functions/role-permissions';
import {
    ROLE_NAME_MAX_LENGTH,
    RoleFormValue,
    RolePermissionGroup,
    RoleRequest,
    RoleRow,
    ROLES_FORM_SECTION,
    ROLES_PERMISSIONS_SECTION,
    RolesFormOptions,
    RolesViewOptions
} from '../models/roles.model';

const PERMISSION_GROUP_COLUMNS = 6;

@Injectable({
    providedIn: 'root'
})
export class RolesFormService {
    private readonly translateService = inject(TranslateService);

    buildFormConfig({
        isOrganizationAsked,
        organizations,
        permissionPrefix,
        permissions,
        prefix
    }: RolesFormOptions): PageFormConfig<RoleFormValue, RoleRow> {
        const organizationOptions = isOrganizationAsked ? toOrganizationOptions(organizations) : null;
        const initialOrganizationId = organizationOptions?.length === 1 ? organizationOptions[0].value : undefined;

        return new PageFormConfig<RoleFormValue, RoleRow>({
            buildSections: role => [
                new FormSection({
                    isTitleVisible: false,
                    key: ROLES_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    isRequired: true,
                                    key: 'name',
                                    validators: [
                                        new FormFieldLengthValidator(
                                            ROLE_NAME_MAX_LENGTH,
                                            FormFieldValidatorType.MaxLength
                                        )
                                    ]
                                })
                            ]
                        }),
                        new FormRow({ fields: [new FormTextareaField({ key: 'description' })] }),
                        ...(!role && organizationOptions
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
                }),
                this.buildPermissionsSection(
                    groupRolePermissions(permissions, role?.permissions),
                    permissionPrefix,
                    `${prefix}.form`,
                    false
                )
            ],
            prefix: `${prefix}.form`,
            toFormValue: role =>
                role
                    ? toRoleValue(role, groupRolePermissions(permissions, role.permissions))
                    : toCreateValue(initialOrganizationId),
            toItem: value => toRoleRequest(value)
        });
    }

    buildViewConfig(
        { permissionPrefix, permissions, prefix, rolePrefix }: RolesViewOptions,
        role: RoleRow
    ): ModalFormConfig<RoleFormValue> {
        const groups = groupRolePermissions(permissions, role.permissions);
        const name = roleLabel(role, rolePrefix, key => this.translateService.instant(key) as string);

        return new ModalFormConfig<RoleFormValue>({
            cancelLabel: `${prefix}.view.buttons.close`,
            initialValue: toRoleValue(role, groups),
            isSubmitHidden: true,
            prefix: `${prefix}.view`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ROLES_FORM_SECTION,
                    rows: [
                        new FormRow({ fields: [new FormInfoField({ items: [{ label: name }], key: 'name' })] }),
                        ...(role.description
                            ? [
                                  new FormRow({
                                      fields: [
                                          new FormInfoField({
                                              items: [{ label: role.description }],
                                              key: 'description'
                                          })
                                      ]
                                  })
                              ]
                            : [])
                    ]
                }),
                this.buildPermissionsSection(groups, permissionPrefix, `${prefix}.view`, true)
            ]
        });
    }

    private buildPermissionsSection(
        groups: RolePermissionGroup[],
        permissionPrefix: string,
        formPrefix: string,
        isDisabled: boolean
    ): FormSection {
        const translate = (key: string): unknown => this.translateService.instant(key);
        const fields =
            groups.length > 0
                ? groups.map(
                      ({ entries, group }) =>
                          new FormCheckboxGroupField({
                              columns: PERMISSION_GROUP_COLUMNS,
                              isDisabled,
                              isRequired: isDisabled ? false : (value: FormValue) => !hasPermission(value),
                              key: group,
                              label: rolePermissionGroupLabel(group, permissionPrefix, translate),
                              options: entries.map(entry => ({
                                  label: rolePermissionLabel(entry, permissionPrefix, translate),
                                  value: entry.key
                              }))
                          })
                  )
                : [
                      new FormInfoField({
                          isLabelVisible: false,
                          items: [{ label: String(translate(`${formPrefix}.${ROLES_PERMISSIONS_SECTION}.empty`)) }],
                          key: 'empty'
                      })
                  ];

        return new FormSection({ key: ROLES_PERMISSIONS_SECTION, rows: [new FormRow({ fields })] });
    }
}

function hasPermission(value: FormValue): boolean {
    return toRolePermissions(value[ROLES_PERMISSIONS_SECTION]).length > 0;
}

function toCreateValue(organizationId: string | undefined): RoleFormValue | undefined {
    return organizationId
        ? { [ROLES_FORM_SECTION]: { description: '', name: '', organizationId }, [ROLES_PERMISSIONS_SECTION]: {} }
        : undefined;
}

function toOrganizationOptions(organizations: PageOrganization[]): FormFieldOption[] {
    return organizations.map(({ id, name }) => ({ label: name, value: id }));
}

function toRoleRequest({ main, permissions }: RoleFormValue): RoleRequest {
    const { description, name, organizationId } = main;

    return {
        name: name.trim(),
        description: description?.trim() ?? '',
        permissions: toRolePermissions(permissions),
        ...(organizationId ? { organizationId } : {})
    };
}

function toRoleValue(role: RoleRow, groups: RolePermissionGroup[]): RoleFormValue {
    return {
        [ROLES_FORM_SECTION]: { description: role.description ?? '', name: role.name },
        [ROLES_PERMISSIONS_SECTION]: Object.fromEntries(
            groups.map(({ entries, group }) => [
                group,
                entries.filter(({ key }) => role.permissions.includes(key)).map(({ key }) => key)
            ])
        )
    };
}
