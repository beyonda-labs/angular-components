import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';

import { HeaderActionType } from '../../header/models/header.model';
import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { PageItem } from './page-item.model';

export enum PageActionScope {
    Global = 'global',
    Group = 'group',
    Item = 'item',
    Single = 'single'
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

export type PageActionConfirmation<TItem extends PageItem = PageItem> = (
    items: TItem[],
    confirmation: ConfirmationModalConfig
) => ConfirmationModalConfig | Observable<ConfirmationModalConfig>;

export type PageStandardActionDefaults = Pick<PageActionParameters, 'icon' | 'scope' | 'type' | 'zone'>;

export class PageAction<TItem extends PageItem = PageItem> {
    key: string;
    scope: PageActionScope;
    type: HeaderActionType;
    zone: PageActionZone;

    confirmation?: PageActionConfirmation<TItem>;
    handler?: (items: TItem[]) => void;
    icon?: IconDefinition;
    label?: string;
    subActions?: PageAction<TItem>[];
    tooltip?: string;

    constructor({
        confirmation,
        handler,
        icon,
        key,
        label,
        scope,
        subActions,
        tooltip,
        type,
        zone
    }: PageActionParameters<TItem>) {
        this.confirmation = confirmation;
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

export interface PageActionParameters<TItem extends PageItem = PageItem> {
    key: string;
    scope: PageActionScope;
    zone: PageActionZone;

    confirmation?: PageActionConfirmation<TItem>;
    handler?: (items: TItem[]) => void;
    icon?: IconDefinition;
    label?: string;
    subActions?: PageAction<TItem>[];
    tooltip?: string;
    type?: HeaderActionType;
}

const DEFAULT_ACTION_TYPES: Record<PageActionZone, HeaderActionType> = {
    [PageActionZone.Left]: HeaderActionType.Text,
    [PageActionZone.Menu]: HeaderActionType.Text,
    [PageActionZone.Right]: HeaderActionType.SecondaryButton
};

export const PAGE_ADD_ACTION_DEFAULTS: PageStandardActionDefaults & Pick<PageActionParameters, 'key'> = {
    icon: faPlus,
    key: 'add-group',
    scope: PageActionScope.Group,
    type: HeaderActionType.PrimaryButton,
    zone: PageActionZone.Right
};

export const PAGE_STANDARD_ACTION_DEFAULTS: Record<PageStandardAction, PageStandardActionDefaults> = {
    [PageStandardAction.Create]: {
        icon: faPlus,
        scope: PageActionScope.Global,
        type: HeaderActionType.PrimaryButton,
        zone: PageActionZone.Right
    },
    [PageStandardAction.CreateCategory]: { scope: PageActionScope.Global, zone: PageActionZone.Right },
    [PageStandardAction.Delete]: { scope: PageActionScope.Item, zone: PageActionZone.Menu },
    [PageStandardAction.DeleteCategory]: { scope: PageActionScope.Item, zone: PageActionZone.Menu },
    [PageStandardAction.DeleteTrashItem]: { scope: PageActionScope.Item, zone: PageActionZone.Menu },
    [PageStandardAction.Edit]: { scope: PageActionScope.Single, zone: PageActionZone.Left },
    [PageStandardAction.EditCategory]: { scope: PageActionScope.Single, zone: PageActionZone.Left },
    [PageStandardAction.Move]: { scope: PageActionScope.Item, zone: PageActionZone.Menu },
    [PageStandardAction.RestoreTrashItem]: { scope: PageActionScope.Item, zone: PageActionZone.Left }
};
