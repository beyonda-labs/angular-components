export abstract class TableCell {
    content: unknown;
    type: CellType;
    translate: boolean;

    tooltip?: string;

    constructor({ content, type, translate = false, tooltip }: TableCellParameters) {
        this.content = content;
        this.tooltip = tooltip;
        this.translate = translate;
        this.type = type;
    }
}

export interface TableCellParameters {
    content: unknown;
    type: CellType;

    tooltip?: string;
    translate?: boolean;
}

export enum CellType {
    Text = 'text',
    Link = 'link'
}

export class TextTableCell extends TableCell {
    constructor({ content, translate, tooltip }: TextTableCellParameters) {
        super({ content, type: CellType.Text, translate, tooltip });
    }
}

export interface TextTableCellParameters {
    content: string;

    tooltip?: string;
    translate?: boolean;
}

export class LinkTableCell extends TableCell {
    action: () => void;

    constructor({ action, content, translate, tooltip }: LinkTableCellParameters) {
        super({ content, type: CellType.Link, translate, tooltip });
        this.action = action;
    }
}

export interface LinkTableCellParameters {
    action: () => void;
    content: string;

    tooltip?: string;
    translate?: boolean;
}
