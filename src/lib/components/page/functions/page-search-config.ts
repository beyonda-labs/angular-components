import { SearchConfig } from '../../search/models/search.model';
import { PageConfig } from '../models/page.model';
import { PageSearchConfigOptions } from '../models/page-search.model';
import { buildPageOwnerField } from './page-owner-filter';

export function buildPageSearchConfig(
    { prefix, tableConfig }: Pick<PageConfig, 'prefix' | 'tableConfig'>,
    { filters, onFiltersChange, onPanelOpen, owners }: PageSearchConfigOptions
): SearchConfig | null {
    const search = tableConfig?.search;

    if (!search) {
        return null;
    }

    const ownerField = search.isOwnerFilterEnabled ? buildPageOwnerField(owners) : null;

    return new SearchConfig({
        fields: ownerField ? [...search.fields, ownerField] : search.fields,
        filters,
        mainField: search.mainField,
        onFiltersChange,
        onPanelOpen: search.isOwnerFilterEnabled ? onPanelOpen : undefined,
        prefix: `${prefix}.search`
    });
}
