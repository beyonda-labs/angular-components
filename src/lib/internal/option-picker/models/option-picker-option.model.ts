export interface OptionPickerOption {
    label: string;
    value: string;

    badge?: string;
    /** Nesting level, rendered as an indent while the list is not being filtered. */
    depth?: number;
    description?: string;
    isDisabled?: boolean;
}
