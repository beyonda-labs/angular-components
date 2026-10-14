import { PageItemType } from '../../page/models/page-categories.model';
import { PageItem } from '../../page/models/page-item.model';

export interface OrganizationFolder extends PageItem {
    actions: string[];
    entryType: PageItemType.Category;
    id: string;
    name: string;

    itemCount?: number;
}

export interface OrganizationFolderRowOptions {
    onOpen: (folder: OrganizationFolder) => void;
}

export interface OrganizationFoldersOptions extends OrganizationFolderRowOptions {
    isShown: boolean;
    prefix: string;
}

export const ORGANIZATION_COLUMN_KEY = 'organization';

export const ORGANIZATION_FOLDER_TYPE_FIELD = 'entryType';
