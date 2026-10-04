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
    translate: boolean;
    type: CellType;

    tooltip?: string;

    constructor({ content, type, translate = false, tooltip }: TableCellParameters) {
        this.content = content;
        this.tooltip = tooltip;
        this.translate = translate;
        this.type = type;
    }
}

export class BadgeTableCell extends TableCell {
    badges: BadgeConfig[];

    constructor({ badges, translate, tooltip }: BadgeTableCellParameters) {
        super({ content: badges, type: CellType.Badge, translate, tooltip });
        this.badges = badges;
    }
}

export class DateTableCell extends TableCell {
    format: string;

    value?: Date | number | string | null;

    constructor({ format = 'mediumDate', tooltip, value }: DateTableCellParameters) {
        super({ content: value, type: CellType.Date, tooltip });
        this.format = format;
        this.value = value;
    }
}

export class LinkTableCell extends TableCell {
    action: () => void;

    icon?: IconDefinition;

    constructor({ action, content, icon, translate, tooltip }: LinkTableCellParameters) {
        super({ content, type: CellType.Link, translate, tooltip });
        this.action = action;
        this.icon = icon;
    }
}

export class TagsTableCell extends TableCell {
    tags: string[];

    constructor({ tags, tooltip }: TagsTableCellParameters) {
        super({ content: tags, type: CellType.Tags, tooltip });
        this.tags = tags;
    }
}

export class TextTableCell extends TableCell {
    icon?: IconDefinition;

    constructor({ content, icon, translate, tooltip }: TextTableCellParameters) {
        super({ content, type: CellType.Text, translate, tooltip });
        this.icon = icon;
    }
}

export interface BadgeTableCellParameters {
    badges: BadgeConfig[];

    tooltip?: string;
    translate?: boolean;
}

export interface DateTableCellParameters {
    format?: string;
    tooltip?: string;
    value?: Date | number | string | null;
}

export interface LinkTableCellParameters {
    action: () => void;
    content: string;

    icon?: IconDefinition;
    tooltip?: string;
    translate?: boolean;
}

export interface TableCellParameters {
    content: unknown;
    type: CellType;

    tooltip?: string;
    translate?: boolean;
}

export interface TagsTableCellParameters {
    tags: string[];

    tooltip?: string;
}

export interface TextTableCellParameters {
    content: string;

    icon?: IconDefinition;
    tooltip?: string;
    translate?: boolean;
}
