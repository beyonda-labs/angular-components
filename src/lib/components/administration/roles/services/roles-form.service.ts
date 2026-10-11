import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormCheckboxSectionsField } from '../../../form/models/fields/form-checkbox-sections-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormTextareaField } from '../../../form/models/fields/form-textarea-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldOption } from '../../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import { PageOrganization } from '../../../page/models/page-organization.model';
import { roleLabel } from '../functions/role-labels';
import { groupRolePermissions, rolePermissionSections } from '../functions/role-permissions';
import {
    ROLE_NAME_MAX_LENGTH,
    RoleFormValue,
    RolePermissionGroup,
    RolePermissionsOptions,
    RoleRequest,
    RoleRow,
    ROLES_FORM_SECTION,
    ROLES_PERMISSIONS_FIELD,
    ROLES_PERMISSIONS_SECTION,
    RolesFormOptions,
    RolesViewOptions
} from '../models/roles.model';

@Injectable({
    providedIn: 'root'
})
export class RolesFormService {
    private readonly translateService = inject(TranslateService);

    buildFormConfig({
        groupIcons,
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
                    { groupIcons, permissionPrefix },
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
        { groupIcons, permissionPrefix, permissions, prefix, rolePrefix }: RolesViewOptions,
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
                this.buildPermissionsSection(groups, { groupIcons, permissionPrefix }, `${prefix}.view`, true)
            ]
        });
    }

    private buildPermissionsSection(
        groups: RolePermissionGroup[],
        { groupIcons, permissionPrefix }: Pick<RolePermissionsOptions, 'groupIcons' | 'permissionPrefix'>,
        formPrefix: string,
        isDisabled: boolean
    ): FormSection {
        const translate = (key: string): unknown => this.translateService.instant(key);
        const label = `${formPrefix}.${ROLES_PERMISSIONS_SECTION}.label`;
        const field =
            groups.length > 0
                ? new FormCheckboxSectionsField({
                      isDisabled,
                      isRequired: !isDisabled,
                      key: ROLES_PERMISSIONS_FIELD,
                      label,
                      sections: rolePermissionSections(groups, { groupIcons, permissionPrefix, translate })
                  })
                : new FormInfoField({
                      items: [{ label: String(translate(`${formPrefix}.${ROLES_PERMISSIONS_SECTION}.empty`)) }],
                      key: 'empty',
                      label
                  });

        return new FormSection({
            isTitleVisible: false,
            key: ROLES_PERMISSIONS_SECTION,
            rows: [new FormRow({ fields: [field] })]
        });
    }
}

function toCreateValue(organizationId: string | undefined): RoleFormValue | undefined {
    return organizationId
        ? {
              [ROLES_FORM_SECTION]: { description: '', name: '', organizationId },
              [ROLES_PERMISSIONS_SECTION]: { [ROLES_PERMISSIONS_FIELD]: [] }
          }
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
        permissions: [...new Set(permissions[ROLES_PERMISSIONS_FIELD] ?? [])],
        ...(organizationId ? { organizationId } : {})
    };
}

function toRoleValue(role: RoleRow, groups: RolePermissionGroup[]): RoleFormValue {
    return {
        [ROLES_FORM_SECTION]: { description: role.description ?? '', name: role.name },
        [ROLES_PERMISSIONS_SECTION]: {
            [ROLES_PERMISSIONS_FIELD]: groups
                .flatMap(({ entries }) => entries)
                .filter(({ key }) => role.permissions.includes(key))
                .map(({ key }) => key)
        }
    };
}
