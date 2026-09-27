import { BadgeConfig } from '../../badge/models/badge.model';

export enum CellType {
    Badge = 'badge',
    Link = 'link',
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

export class LinkTableCell extends TableCell {
    action: () => void;

    constructor({ action, content, translate, tooltip }: LinkTableCellParameters) {
        super({ content, type: CellType.Link, translate, tooltip });
        this.action = action;
    }
}

export class TextTableCell extends TableCell {
    constructor({ content, translate, tooltip }: TextTableCellParameters) {
        super({ content, type: CellType.Text, translate, tooltip });
    }
}

export interface BadgeTableCellParameters {
    badges: BadgeConfig[];

    tooltip?: string;
    translate?: boolean;
}

export interface LinkTableCellParameters {
    action: () => void;
    content: string;

    tooltip?: string;
    translate?: boolean;
}

export interface TableCellParameters {
    content: unknown;
    type: CellType;

    tooltip?: string;
    translate?: boolean;
}

export interface TextTableCellParameters {
    content: string;

    tooltip?: string;
    translate?: boolean;
}
