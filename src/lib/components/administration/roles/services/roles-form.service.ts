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
import { buildDisabledOrganizationField } from '../../functions/organization-fields';
import { roleCopyName } from '../functions/role-copy';
import { roleLabel } from '../functions/role-labels';
import { groupRolePermissions, rolePermissionSections } from '../functions/role-permissions';
import { toRoleCreateRequest, toRoleEditRequest } from '../functions/role-requests';
import {
    ROLE_NAME_MAX_LENGTH,
    RoleFormValue,
    RolePermissionGroup,
    RolePermissionsOptions,
    RoleRow,
    ROLES_FORM_SECTION,
    ROLES_PERMISSIONS_FIELD,
    ROLES_PERMISSIONS_SECTION,
    RolesDuplicateFormOptions,
    RolesFormOptions,
    RolesViewOptions
} from '../models/roles.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';

@Injectable({
    providedIn: 'root'
})
export class RolesFormService {
    private readonly translateService = inject(TranslateService);

    buildDuplicateConfig(options: RolesDuplicateFormOptions, role: RoleRow): ModalFormConfig<RoleFormValue> {
        const { actionOrder, groupOrder, isOrganizationAsked, organizations, permissions, prefix, rolePrefix } =
            options;
        const translate = (key: string): string => this.translateService.instant(key) as string;
        const name = roleCopyName(
            roleLabel(role, rolePrefix, translate),
            translate(`${prefix}.duplicate.copy-suffix`),
            ROLE_NAME_MAX_LENGTH
        );
        const organizationOptions = isOrganizationAsked ? toOrganizationOptions(organizations) : null;

        return new ModalFormConfig<RoleFormValue>({
            allowSubmitWithoutChanges: true,
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: toRoleValue(
                { ...role, name },
                groupRolePermissions(permissions, { actionOrder, groupOrder }),
                copyOrganizationId(role, organizationOptions)
            ),
            prefix: `${prefix}.form`,
            sections: this.buildSections(options),
            submitLabel: `${prefix}.duplicate.buttons.submit`,
            title: `${prefix}.duplicate.title`
        });
    }

    buildFormConfig(options: RolesFormOptions): PageFormConfig<RoleFormValue, RoleRow> {
        const { actionOrder, groupOrder, isOrganizationAsked, organizations, permissions, prefix } = options;
        const organizationOptions = isOrganizationAsked ? toOrganizationOptions(organizations) : null;
        const order = { actionOrder, groupOrder };

        return new PageFormConfig<RoleFormValue, RoleRow>({
            buildSections: role => this.buildSections(options, role),
            prefix: `${prefix}.form`,
            toFormValue: role =>
                role
                    ? toRoleValue(
                          role,
                          groupRolePermissions(permissions, order, role.permissions),
                          isOrganizationAsked ? role.organizationId : undefined
                      )
                    : toCreateValue(onlyOrganizationId(organizationOptions)),
            toItem: (value, role) => (role ? toRoleEditRequest(value) : toRoleCreateRequest(value))
        });
    }

    buildViewConfig(
        { actionOrder, groupIcons, groupOrder, permissionPrefix, permissions, prefix, rolePrefix }: RolesViewOptions,
        role: RoleRow
    ): ModalFormConfig<RoleFormValue> {
        const groups = groupRolePermissions(permissions, { actionOrder, groupOrder }, role.permissions);
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

    private buildSections(
        {
            actionOrder,
            groupIcons,
            groupOrder,
            isOrganizationAsked,
            organizations,
            permissionPrefix,
            permissions,
            prefix
        }: RolesFormOptions,
        role?: RoleRow
    ): FormSection[] {
        return [
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
                                    new FormFieldLengthValidator(ROLE_NAME_MAX_LENGTH, FormFieldValidatorType.MaxLength)
                                ]
                            })
                        ]
                    }),
                    new FormRow({ fields: [new FormTextareaField({ key: 'description' })] }),
                    ...(isOrganizationAsked ? buildOrganizationRows(organizations, role) : [])
                ]
            }),
            this.buildPermissionsSection(
                groupRolePermissions(permissions, { actionOrder, groupOrder }, role?.permissions),
                { groupIcons, permissionPrefix },
                `${prefix}.form`,
                false
            )
        ];
    }
}

function buildOrganizationRows(organizations: PageOrganization[], role?: RoleRow): FormRow[] {
    const field = role
        ? buildDisabledOrganizationField(role)
        : new FormSelectField({
              isRequired: true,
              key: 'organizationId',
              options: toOrganizationOptions(organizations)
          });

    return field ? [new FormRow({ fields: [field] })] : [];
}

function copyOrganizationId(
    { organizationId }: Pick<RoleRow, 'organizationId'>,
    organizationOptions: FormFieldOption[] | null
): string | undefined {
    const source = organizationOptions?.find(({ value }) => value === organizationId);

    return source?.value ?? onlyOrganizationId(organizationOptions);
}

function onlyOrganizationId(organizationOptions: FormFieldOption[] | null): string | undefined {
    return organizationOptions?.length === 1 ? organizationOptions[0].value : undefined;
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

function toRoleValue(
    role: Pick<RoleRow, 'description' | 'name' | 'permissions'>,
    groups: RolePermissionGroup[],
    organizationId?: string | null
): RoleFormValue {
    return {
        [ROLES_FORM_SECTION]: {
            description: role.description ?? '',
            name: role.name,
            ...(organizationId ? { organizationId } : {})
        },
        [ROLES_PERMISSIONS_SECTION]: {
            [ROLES_PERMISSIONS_FIELD]: groups
                .flatMap(({ entries }) => entries)
                .filter(({ key }) => role.permissions.includes(key))
                .map(({ key }) => key)
        }
    };
}
