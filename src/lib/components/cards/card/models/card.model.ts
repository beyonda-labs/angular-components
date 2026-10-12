export class CardConfig {
    count?: number;
    title?: string;

    constructor({ count, title }: CardConfigParameters = {}) {
        this.count = count;
        this.title = title;
    }
}

export interface CardConfigParameters {
    count?: number;
    title?: string;
}
