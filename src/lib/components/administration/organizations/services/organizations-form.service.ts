import { inject, Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig, ModalFormSize } from '../../../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import {
    FormFieldCustomValidator,
    FormFieldLengthValidator,
    FormFieldValidatorType
} from '../../../form/models/form-field-validator.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import { contentCountLines } from '../../functions/content-counts';
import { buildGroupMemberListRows } from '../../functions/group-member-lists';
import {
    ORGANIZATION_NAME_MAX_LENGTH,
    OrganizationDeleteFormOptions,
    OrganizationDeleteFormValue,
    OrganizationDetail,
    OrganizationEditFormValue,
    OrganizationFormValue,
    OrganizationRow,
    ORGANIZATIONS_ADMINISTRATORS_SECTION,
    ORGANIZATIONS_FORM_SECTION,
    ORGANIZATIONS_GROUPS_SECTION,
    ORGANIZATIONS_LIBRARY_CONTENT,
    ORGANIZATIONS_UNGROUPED_KEY,
    OrganizationStatus
} from '../models/organizations.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsFormService {
    private readonly translateService = inject(TranslateService);

    buildDeleteConfig({
        contentLabels,
        counts,
        organization,
        prefix
    }: OrganizationDeleteFormOptions): ModalFormConfig<OrganizationDeleteFormValue> {
        const translate = (key: string, parameters?: Record<string, unknown>): string =>
            this.translateService.instant(key, parameters) as string;
        const { name } = organization;
        const labels = {
            ...Object.fromEntries(ORGANIZATIONS_LIBRARY_CONTENT.map(key => [key, `${prefix}.content.${key}`])),
            ...contentLabels
        };

        return new ModalFormConfig<OrganizationDeleteFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: { [ORGANIZATIONS_FORM_SECTION]: { name: '' } },
            isSubmitDanger: true,
            prefix: `${prefix}.delete`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormInfoField({
                                    isLabelVisible: false,
                                    items: [{ label: translate(`${prefix}.delete.message`, { name }) }],
                                    key: 'message'
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormListField({
                                    emptyKey: `${prefix}.content.empty`,
                                    items: contentCountLines(
                                        counts,
                                        { contentLabels: labels, countKey: `${prefix}.content.count` },
                                        translate
                                    ),
                                    key: 'content',
                                    label: `${prefix}.content.label`
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    isRequired: true,
                                    key: 'name',
                                    label: translate(`${prefix}.delete.confirm`, { name }),
                                    validators: [
                                        new FormFieldCustomValidator(
                                            matchesName(name, `${prefix}.delete.name-mismatch`)
                                        )
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: `${prefix}.delete.submit`,
            title: `${prefix}.delete.title`
        });
    }

    buildEditFormConfig(prefix: string, organization: OrganizationDetail): ModalFormConfig<OrganizationEditFormValue> {
        return new ModalFormConfig<OrganizationEditFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            initialValue: { [ORGANIZATIONS_FORM_SECTION]: { name: organization.name, status: organization.status } },
            prefix: `${prefix}.form`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [
                        new FormRow({ fields: [buildNameField()] }),
                        new FormRow({
                            fields: [
                                new FormSelectField({
                                    isRequired: true,
                                    key: 'status',
                                    options: Object.values(OrganizationStatus).map(status => ({
                                        label: `${prefix}.status.${status}`,
                                        value: status
                                    }))
                                })
                            ]
                        })
                    ]
                }),
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_ADMINISTRATORS_SECTION,
                    rows: buildAdministratorRows(organization, `${prefix}.form.${ORGANIZATIONS_ADMINISTRATORS_SECTION}`)
                }),
                new FormSection({
                    key: ORGANIZATIONS_GROUPS_SECTION,
                    rows: buildGroupRows(organization, `${prefix}.form.${ORGANIZATIONS_GROUPS_SECTION}`)
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: SUBMIT_LABEL_KEY,
            title: `${prefix}.form.edit.title`
        });
    }

    buildFormConfig(prefix: string): PageFormConfig<OrganizationFormValue, OrganizationRow> {
        return new PageFormConfig<OrganizationFormValue, OrganizationRow>({
            buildSections: () => [
                new FormSection({
                    isTitleVisible: false,
                    key: ORGANIZATIONS_FORM_SECTION,
                    rows: [new FormRow({ fields: [buildNameField()] })]
                })
            ],
            prefix: `${prefix}.form`,
            size: ModalFormSize.Medium,
            toItem: value => ({ name: value[ORGANIZATIONS_FORM_SECTION].name.trim() })
        });
    }
}

function buildAdministratorRows({ administrators }: OrganizationDetail, administratorsPrefix: string): FormRow[] {
    return buildGroupMemberListRows(
        [
            {
                id: ORGANIZATIONS_ADMINISTRATORS_SECTION,
                members: administrators,
                name: `${administratorsPrefix}.label`
            }
        ],
        administratorsPrefix
    );
}

function buildGroupRows({ groups, ungroupedMembers }: OrganizationDetail, groupsPrefix: string): FormRow[] {
    const ungrouped =
        ungroupedMembers.length > 0
            ? buildGroupMemberListRows(
                  [{ id: ORGANIZATIONS_UNGROUPED_KEY, members: ungroupedMembers, name: `${groupsPrefix}.ungrouped` }],
                  groupsPrefix
              )
            : [];

    return [...buildGroupMemberListRows(groups, groupsPrefix), ...ungrouped];
}

function buildNameField(): FormTextField {
    return new FormTextField({
        isRequired: true,
        key: 'name',
        validators: [new FormFieldLengthValidator(ORGANIZATION_NAME_MAX_LENGTH, FormFieldValidatorType.MaxLength)]
    });
}

function matchesName(name: string, messageKey: string): ValidatorFn {
    return ({ value }) => (!value || value === name ? null : { nameMismatch: { messageKey } });
}
