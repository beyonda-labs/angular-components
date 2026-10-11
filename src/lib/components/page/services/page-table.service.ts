import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { isCategoryRow, readRowField } from '../functions/page-row';
import { readParentPath, withOriginTooltip } from '../functions/page-trash-origin';
import { PageConfig } from '../models/page.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';

@Injectable({
    providedIn: 'root'
})
export class PageTableService {
    private readonly translateService = inject(TranslateService);

    loadRow(
        config: PageConfig,
        item: PageItem,
        viewMode: PageViewMode,
        onOpenCategory: (category: PageItem) => void
    ): TableCell[] {
        const { prefix, tableConfig } = config;
        const categoriesConfig = tableConfig?.categoriesConfig;

        if (!tableConfig) {
            return [];
        }

        const cells =
            categoriesConfig && isCategoryRow(item, categoriesConfig)
                ? loadCategoryRow(item, categoriesConfig, viewMode, onOpenCategory)
                : tableConfig.loadRow(item, viewMode);

        return categoriesConfig && viewMode === PageViewMode.Trash
            ? this.withOrigin(cells, item, categoriesConfig, prefix)
            : cells;
    }

    private withOrigin(
        cells: TableCell[],
        item: PageItem,
        categoriesConfig: PageCategoriesConfig,
        prefix: string
    ): TableCell[] {
        const parentPath = readParentPath(item, categoriesConfig.parentPathField);

        return parentPath
            ? withOriginTooltip(cells, this.translateService.instant(`${prefix}.categories.root`), parentPath)
            : cells;
    }
}

function loadCategoryRow(
    category: PageItem,
    categoriesConfig: PageCategoriesConfig,
    viewMode: PageViewMode,
    onOpenCategory: (category: PageItem) => void
): TableCell[] {
    if (categoriesConfig.loadRow) {
        return categoriesConfig.loadRow(category, viewMode);
    }

    const name = String(readRowField(category, categoriesConfig.nameField) ?? '');

    return [
        viewMode === PageViewMode.Trash
            ? new TextTableCell({ content: name })
            : new LinkTableCell({ action: () => onOpenCategory(category), content: name })
    ];
}
