import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class PropertiesMenuHeaderConfig {
    subtitle: string;
    title: string;

    icon?: IconDefinition;
    onClose?: () => void;

    constructor({ icon, onClose, subtitle = '', title }: PropertiesMenuHeaderConfigParameters) {
        this.icon = icon;
        this.onClose = onClose;
        this.subtitle = subtitle;
        this.title = title;
    }
}

export interface PropertiesMenuHeaderConfigParameters {
    title: string;

    icon?: IconDefinition;
    /** When set, the header shows a close button that calls it. */
    onClose?: () => void;
    subtitle?: string;
}
