export class PdfViewerToolbarButtons {
    hasDownloadButton: boolean;
    hasFindButton: boolean;
    hasHandToolButton: boolean;
    hasOpenFileButton: boolean;
    hasPagingButtons: boolean;
    hasPresentationModeButton: boolean;
    hasPrintButton: boolean;
    hasPropertiesButton: boolean;
    hasRotateButton: boolean;
    hasSecondaryToolbarButton: boolean;
    hasSidebarButton: boolean;
    hasZoomButtons: boolean;
    hasZoomDropdown: boolean;

    constructor({
        hasDownloadButton = true,
        hasFindButton = true,
        hasHandToolButton = true,
        hasOpenFileButton = true,
        hasPagingButtons = true,
        hasPresentationModeButton = true,
        hasPrintButton = true,
        hasPropertiesButton = true,
        hasRotateButton = true,
        hasSecondaryToolbarButton = true,
        hasSidebarButton = true,
        hasZoomButtons = true,
        hasZoomDropdown = true
    }: PdfViewerToolbarButtonsParameters = {}) {
        this.hasDownloadButton = hasDownloadButton;
        this.hasFindButton = hasFindButton;
        this.hasHandToolButton = hasHandToolButton;
        this.hasOpenFileButton = hasOpenFileButton;
        this.hasPagingButtons = hasPagingButtons;
        this.hasPresentationModeButton = hasPresentationModeButton;
        this.hasPrintButton = hasPrintButton;
        this.hasPropertiesButton = hasPropertiesButton;
        this.hasRotateButton = hasRotateButton;
        this.hasSecondaryToolbarButton = hasSecondaryToolbarButton;
        this.hasSidebarButton = hasSidebarButton;
        this.hasZoomButtons = hasZoomButtons;
        this.hasZoomDropdown = hasZoomDropdown;
    }
}

export interface PdfViewerToolbarButtonsParameters {
    hasDownloadButton?: boolean;
    hasFindButton?: boolean;
    hasHandToolButton?: boolean;
    hasOpenFileButton?: boolean;
    hasPagingButtons?: boolean;
    hasPresentationModeButton?: boolean;
    hasPrintButton?: boolean;
    hasPropertiesButton?: boolean;
    hasRotateButton?: boolean;
    hasSecondaryToolbarButton?: boolean;
    hasSidebarButton?: boolean;
    hasZoomButtons?: boolean;
    hasZoomDropdown?: boolean;
}
