import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { HeaderActionType } from '../../header/models/header.model';
import { PageItem } from './page-item.model';

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
        this.type = type ?? getTypeByZone(zone);
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

function getTypeByZone(zone: PageActionZone): HeaderActionType {
    if (zone === PageActionZone.Right) {
        return HeaderActionType.SecondaryButton;
    }

    return HeaderActionType.Text;
}
