import { SearchFilter } from '../../search/models/search-filter.model';
import { Tab, TabsConfig, TabsVariant } from '../../tabs/models/tabs.model';
import { PageConfig } from '../models/page.model';
import { PageViewMode } from '../models/page-categories.model';

export function buildPageTabs(
    config: PageConfig,
    activeTab: string,
    onTabChange: (key: string) => void
): TabsConfig | null {
    const isTrashEnabled = Boolean(config.tableConfig?.isTrashEnabled);

    if (!isTrashEnabled && config.views.length === 0) {
        return null;
    }

    return new TabsConfig({
        activeTab,
        onTabChange,
        prefix: config.prefix,
        tabs: [
            new Tab({ key: PageViewMode.Table }),
            ...config.views.map(view => new Tab({ key: view.key, label: view.label })),
            ...(isTrashEnabled ? [new Tab({ key: PageViewMode.Trash })] : [])
        ],
        variant: TabsVariant.Segmented
    });
}

export function readViewFilters(config: PageConfig, activeView: string | null): SearchFilter[] {
    return config.views.find(view => view.key === activeView)?.filters ?? [];
}
