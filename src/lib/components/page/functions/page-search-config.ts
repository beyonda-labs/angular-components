import { SearchConfig, SearchField } from '../../search/models/search.model';
import { PageConfig } from '../models/page.model';
import { PageSearchConfigOptions } from '../models/page-search.model';
import { buildPageOrganizationField } from './page-organization-filter';
import { buildPageOwnerField } from './page-owner-filter';

export function buildPageSearchConfig(
    { prefix, tableConfig }: Pick<PageConfig, 'prefix' | 'tableConfig'>,
    { filters, onFiltersChange, onPanelOpen, organizations, owners }: PageSearchConfigOptions
): SearchConfig | null {
    const search = tableConfig?.search;

    if (!search) {
        return null;
    }

    const organizationField = search.isOrganizationFilterEnabled ? buildPageOrganizationField(organizations) : null;
    const ownerField = search.isOwnerFilterEnabled ? buildPageOwnerField(owners) : null;
    const asksOnOpen = search.isOrganizationFilterEnabled || search.isOwnerFilterEnabled;

    return new SearchConfig({
        fields: [...search.fields, ...[organizationField, ownerField].filter(isField)],
        filters,
        mainField: search.mainField,
        onFiltersChange,
        onPanelOpen: asksOnOpen ? onPanelOpen : undefined,
        prefix: `${prefix}.search`
    });
}

function isField(field: SearchField | null): field is SearchField {
    return field !== null;
}
