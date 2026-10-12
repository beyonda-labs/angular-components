import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class CardStat {
    key: string;
    label: string;
    value: number;

    icon?: IconDefinition;

    constructor({ icon, key, label, value }: CardStatParameters) {
        this.icon = icon;
        this.key = key;
        this.label = label;
        this.value = value;
    }
}

export class CardStatsConfig {
    items: CardStat[];

    constructor({ items }: CardStatsConfigParameters) {
        this.items = items;
    }
}

export interface CardStatParameters {
    key: string;
    label: string;
    value: number;

    icon?: IconDefinition;
}

export interface CardStatsConfigParameters {
    items: CardStat[];
}
