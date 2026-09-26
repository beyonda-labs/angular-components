/** A demo button of the style guide: a translated label and what pressing it does. */
export interface StyleGuideButton {
    action: () => void;
    label: string;

    isPrimary?: boolean;
}
