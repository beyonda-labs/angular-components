import { Injectable } from '@angular/core';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

import { PageCategoriesConfig } from '../../page/models/page-categories.model';
import { LinkTableCell, TableCell } from '../../table/models/table-cell.model';
import { buildOrganizationFoldersConfig } from '../functions/organization-folders';
import {
    OrganizationFolder,
    OrganizationFolderRowOptions,
    OrganizationFoldersOptions
} from '../models/organization-folders.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationFolderTableService {
    buildFoldersConfig({
        isShown,
        onOpen,
        prefix
    }: OrganizationFoldersOptions): PageCategoriesConfig<OrganizationFolder> | undefined {
        return isShown ? buildOrganizationFoldersConfig(folder => this.loadRow(folder, { onOpen }), prefix) : undefined;
    }

    loadRow(folder: OrganizationFolder, { onOpen }: OrganizationFolderRowOptions): TableCell[] {
        return [new LinkTableCell({ action: () => onOpen(folder), content: folder.name, icon: faFolder })];
    }
}
