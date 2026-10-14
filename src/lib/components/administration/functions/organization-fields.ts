import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormFieldColumn, FormFieldOption } from '../../form/models/form-field.model';
import {
    PAGE_ORGANIZATION_FIELD,
    PageOrganization,
    PageOrganizationItem
} from '../../page/models/page-organization.model';
import { PageCategoryPathEntry } from '../../page/models/page-state.model';

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

export function initialOrganizationId(
    organizationOptions: FormFieldOption[] | null,
    folder?: Pick<PageCategoryPathEntry, 'id'>
): string | undefined {
    const opened = folder ? organizationOptions?.find(({ value }) => value === String(folder.id)) : undefined;

    return opened?.value ?? (organizationOptions?.length === 1 ? organizationOptions[0].value : undefined);
}

export function toOrganizationOptions(organizations: PageOrganization[]): FormFieldOption[] {
    return organizations.map(({ id, name }) => ({ label: name, value: id }));
}
