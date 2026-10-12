import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormFieldColumn } from '../../form/models/form-field.model';
import { PAGE_ORGANIZATION_FIELD, PageOrganizationItem } from '../../page/models/page-organization.model';

export function buildDisabledOrganizationField(
    { organizationId, organizationName }: Pick<PageOrganizationItem, 'organizationId' | 'organizationName'>,
    columns?: FormFieldColumn
): FormSelectField | null {
    return organizationId
        ? new FormSelectField({
              columns,
              isDisabled: true,
              key: PAGE_ORGANIZATION_FIELD,
              options: [{ label: organizationName ?? organizationId, value: organizationId }]
          })
        : null;
}
