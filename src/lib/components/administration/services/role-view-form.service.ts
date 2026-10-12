import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxSectionsField } from '../../form/models/fields/form-checkbox-sections-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { roleLabel } from '../functions/role-labels';
import { groupRolePermissions, heldPermissionKeys, rolePermissionSections } from '../functions/role-permissions';
import {
    RolePermissionGroup,
    RolePermissionsOptions,
    ROLES_FORM_SECTION,
    ROLES_PERMISSIONS_FIELD,
    ROLES_PERMISSIONS_SECTION,
    RoleViewOptions,
    RoleViewValue,
    ViewedRole
} from '../models/role-permissions.model';

@Injectable({
    providedIn: 'root'
})
export class RoleViewFormService {
    private readonly translateService = inject(TranslateService);

    buildPermissionsSection(
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

    buildViewConfig(
        { actionOrder, groupIcons, groupOrder, permissionPrefix, permissions, prefix, rolePrefix }: RoleViewOptions,
        role: ViewedRole
    ): ModalFormConfig<RoleViewValue> {
        const groups = groupRolePermissions(permissions, { actionOrder, groupOrder }, role.permissions);
        const name = roleLabel(role, rolePrefix, key => this.translateService.instant(key) as string);

        return new ModalFormConfig<RoleViewValue>({
            cancelLabel: `${prefix}.view.buttons.close`,
            initialValue: {
                [ROLES_FORM_SECTION]: { description: role.description ?? '', name: role.name },
                [ROLES_PERMISSIONS_SECTION]: { [ROLES_PERMISSIONS_FIELD]: heldPermissionKeys(groups, role.permissions) }
            },
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
}
