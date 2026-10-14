import { FormFieldOption } from '../../../form/models/form-field.model';
import { OrganizationStatus } from '../models/organizations.model';

export function organizationStatusLabel(prefix: string, status: OrganizationStatus): string {
    return `${prefix}.status.${status}`;
}

export function organizationStatusOptions(prefix: string): FormFieldOption[] {
    return Object.values(OrganizationStatus).map(status => ({
        label: organizationStatusLabel(prefix, status),
        value: status
    }));
}
