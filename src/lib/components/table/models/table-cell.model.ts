import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BadgeConfig } from '../../badge/models/badge.model';

export enum CellType {
    Badge = 'badge',
    Date = 'date',
    Link = 'link',
    Tags = 'tags',
    Text = 'text'
}

export abstract class TableCell {
    content: unknown;
    isTranslationKey: boolean;
    type: CellType;

    tooltip?: string;
    tooltipItems?: string[];

    constructor({ content, isTranslationKey = false, type, tooltip, tooltipItems }: TableCellParameters) {
        this.content = content;
        this.isTranslationKey = isTranslationKey;
        this.tooltip = tooltip;
        this.tooltipItems = tooltipItems;
        this.type = type;
    }
}

export class BadgeTableCell extends TableCell {
    badges: BadgeConfig[];

    constructor({ badges, isTranslationKey, tooltip, tooltipItems }: BadgeTableCellParameters) {
        super({ content: badges, type: CellType.Badge, isTranslationKey, tooltip, tooltipItems });
        this.badges = badges;
    }
}

export class DateTableCell extends TableCell {
    format: string;

    value?: Date | number | string | null;

    constructor({ format = 'mediumDate', tooltip, tooltipItems, value }: DateTableCellParameters = {}) {
        super({ content: value, type: CellType.Date, tooltip, tooltipItems });
        this.format = format;
        this.value = value;
    }
}

export class LinkTableCell extends TableCell {
    action: () => void;

    icon?: IconDefinition;
    iconLabel?: string;

    constructor({
        action,
        content,
        icon,
        iconLabel,
        isTranslationKey,
        tooltip,
        tooltipItems
    }: LinkTableCellParameters) {
        super({ content, type: CellType.Link, isTranslationKey, tooltip, tooltipItems });
        this.action = action;
        this.icon = icon;
        this.iconLabel = iconLabel;
    }
}

export class TagsTableCell extends TableCell {
    tags: string[];

    constructor({ tags, tooltip, tooltipItems }: TagsTableCellParameters) {
        super({ content: tags, type: CellType.Tags, tooltip, tooltipItems });
        this.tags = tags;
    }
}

export class TextTableCell extends TableCell {
    icon?: IconDefinition;
    iconLabel?: string;

    constructor({ content, icon, iconLabel, isTranslationKey, tooltip, tooltipItems }: TextTableCellParameters) {
        super({ content, type: CellType.Text, isTranslationKey, tooltip, tooltipItems });
        this.icon = icon;
        this.iconLabel = iconLabel;
    }
}

export interface BadgeTableCellParameters {
    badges: BadgeConfig[];

    isTranslationKey?: boolean;
    tooltip?: string;
    tooltipItems?: string[];
}

export interface DateTableCellParameters {
    format?: string;
    tooltip?: string;
    tooltipItems?: string[];
    value?: Date | number | string | null;
}

export interface LinkTableCellParameters {
    action: () => void;
    content: string;

    icon?: IconDefinition;
    iconLabel?: string;
    isTranslationKey?: boolean;
    tooltip?: string;
    tooltipItems?: string[];
}

export interface TableCellParameters {
    content: unknown;
    type: CellType;

    isTranslationKey?: boolean;
    tooltip?: string;
    tooltipItems?: string[];
}

export interface TagsTableCellParameters {
    tags: string[];

    tooltip?: string;
    tooltipItems?: string[];
}

export interface TextTableCellParameters {
    content: string;

    icon?: IconDefinition;
    iconLabel?: string;
    isTranslationKey?: boolean;
    tooltip?: string;
    tooltipItems?: string[];
}
