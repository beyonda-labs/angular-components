import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormTextareaField } from '../../../form/models/fields/form-textarea-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldOption } from '../../../form/models/form-field.model';
import { FormFieldLengthValidator, FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { PAGE_FORM_CANCEL_LABEL, PageFormConfig } from '../../../page/models/page-form.model';
import { PageOrganization } from '../../../page/models/page-organization.model';
import {
    buildDisabledOrganizationField,
    initialOrganizationId,
    toOrganizationOptions
} from '../../functions/organization-fields';
import { roleLabel } from '../../functions/role-labels';
import { groupRolePermissions, heldPermissionKeys } from '../../functions/role-permissions';
import {
    RolePermissionGroup,
    ROLES_FORM_SECTION,
    ROLES_PERMISSIONS_FIELD,
    ROLES_PERMISSIONS_SECTION
} from '../../models/role-permissions.model';
import { RoleViewFormService } from '../../services/role-view-form.service';
import { roleCopyName } from '../functions/role-copy';
import { toRoleCreateRequest, toRoleEditRequest } from '../functions/role-requests';
import {
    ROLE_NAME_MAX_LENGTH,
    RoleFormValue,
    RoleRow,
    RolesDuplicateFormOptions,
    RolesFormOptions
} from '../models/roles.model';

@Injectable({
    providedIn: 'root'
})
export class RolesFormService {
    private readonly roleViewFormService = inject(RoleViewFormService);
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
            canSubmitWithoutChanges: true,
            cancelLabel: PAGE_FORM_CANCEL_LABEL,
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
            toFormValue: (role, folder) =>
                role
                    ? toRoleValue(
                          role,
                          groupRolePermissions(permissions, order, role.permissions),
                          isOrganizationAsked ? role.organizationId : undefined
                      )
                    : toCreateValue(initialOrganizationId(organizationOptions, folder)),
            toItem: (value, role) => (role ? toRoleEditRequest(value) : toRoleCreateRequest(value))
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
            this.roleViewFormService.buildPermissionsSection(
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

    return source?.value ?? initialOrganizationId(organizationOptions);
}

function toCreateValue(organizationId: string | undefined): RoleFormValue | undefined {
    return organizationId
        ? {
              [ROLES_FORM_SECTION]: { description: '', name: '', organizationId },
              [ROLES_PERMISSIONS_SECTION]: { [ROLES_PERMISSIONS_FIELD]: [] }
          }
        : undefined;
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
            [ROLES_PERMISSIONS_FIELD]: heldPermissionKeys(groups, role.permissions)
        }
    };
}
