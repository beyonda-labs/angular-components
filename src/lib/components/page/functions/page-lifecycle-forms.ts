import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { PAGE_LIFECYCLE_FORM_SECTION as FORM_SECTION, PageLifecycleFormValue } from '../models/page-lifecycle.model';

export function buildChangeStatusForm(
    prefix: string,
    field: string,
    statuses: readonly string[]
): ModalFormConfig<PageLifecycleFormValue> {
    return buildSingleFieldForm(
        `${prefix}.change-status`,
        { [FORM_SECTION]: { [field]: '' } },
        new FormSelectField({
            columns: 12,
            isRequired: true,
            key: field,
            options: statuses.map(status => ({ label: `${prefix}.status.${status}`, value: status }))
        })
    );
}

export function buildDuplicateForm(
    prefix: string,
    nameField: string,
    name: string
): ModalFormConfig<PageLifecycleFormValue> {
    return buildSingleFieldForm(
        `${prefix}.duplicate`,
        { [FORM_SECTION]: { [nameField]: name } },
        new FormTextField({ columns: 12, isRequired: true, key: nameField })
    );
}

function buildSingleFieldForm(
    prefix: string,
    initialValue: PageLifecycleFormValue,
    field: FormField
): ModalFormConfig<PageLifecycleFormValue> {
    return new ModalFormConfig<PageLifecycleFormValue>({
        initialValue,
        prefix,
        sections: [
            new FormSection({ isTitleVisible: false, key: FORM_SECTION, rows: [new FormRow({ fields: [field] })] })
        ]
    });
}
