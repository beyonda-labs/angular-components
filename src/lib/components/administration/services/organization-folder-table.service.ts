import { Injectable } from '@angular/core';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

import { LinkTableCell, TableCell } from '../../table/models/table-cell.model';
import { OrganizationFolder, OrganizationFolderRowOptions } from '../models/organization-folders.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationFolderTableService {
    loadRow(folder: OrganizationFolder, { onOpen }: OrganizationFolderRowOptions): TableCell[] {
        return [new LinkTableCell({ action: () => onOpen(folder), content: folder.name, icon: faFolder })];
    }
}
