import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { HeaderActionType } from '../../header/models/header.model';
import { PageItem } from './page-item.model';

export enum PageActionScope {
    Global = 'global',
    Group = 'group',
    Item = 'item'
}

export enum PageActionZone {
    Left = 'left',
    Menu = 'menu',
    Right = 'right'
}

export enum PageStandardAction {
    Create = 'create',
    CreateCategory = 'create-category',
    Delete = 'delete',
    DeleteCategory = 'delete-category',
    DeleteTrashItem = 'delete-trash-item',
    Edit = 'edit',
    EditCategory = 'edit-category',
    Move = 'move',
    RestoreTrashItem = 'restore-trash-item'
}

export class PageAction {
    key: string;
    scope: PageActionScope;
    type: HeaderActionType;
    zone: PageActionZone;

    handler?: (items?: PageItem[]) => void;
    icon?: IconDefinition;
    label?: string;
    subActions?: PageAction[];
    tooltip?: string;

    constructor({ key, scope, type, zone, handler, icon, label, tooltip, subActions }: PageActionParameters) {
        this.handler = handler;
        this.icon = icon;
        this.key = key;
        this.label = label;
        this.scope = scope;
        this.subActions = subActions;
        this.tooltip = tooltip;
        this.type = type ?? DEFAULT_ACTION_TYPES[zone];
        this.zone = zone;
    }
}

export interface PageActionParameters {
    key: string;
    scope: PageActionScope;
    zone: PageActionZone;

    handler?: (items?: PageItem[]) => void;
    icon?: IconDefinition;
    label?: string;
    subActions?: PageAction[];
    tooltip?: string;
    type?: HeaderActionType;
}

const DEFAULT_ACTION_TYPES: Record<PageActionZone, HeaderActionType> = {
    [PageActionZone.Left]: HeaderActionType.Text,
    [PageActionZone.Menu]: HeaderActionType.Text,
    [PageActionZone.Right]: HeaderActionType.SecondaryButton
};
