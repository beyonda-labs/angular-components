export interface PdfViewerToolbarButtonsParameters {
    downloadButton?: boolean;
    findButton?: boolean;
    handToolButton?: boolean;
    openFileButton?: boolean;
    pagingButtons?: boolean;
    presentationModeButton?: boolean;
    printButton?: boolean;
    propertiesButton?: boolean;
    rotateButton?: boolean;
    secondaryToolbarButton?: boolean;
    sidebarButton?: boolean;
    zoomButtons?: boolean;
    zoomDropdown?: boolean;
}

export class PdfViewerToolbarButtons {
    downloadButton: boolean;
    findButton: boolean;
    handToolButton: boolean;
    openFileButton: boolean;
    pagingButtons: boolean;
    presentationModeButton: boolean;
    printButton: boolean;
    propertiesButton: boolean;
    rotateButton: boolean;
    secondaryToolbarButton: boolean;
    sidebarButton: boolean;
    zoomButtons: boolean;
    zoomDropdown: boolean;

    constructor({
        downloadButton = true,
        findButton = true,
        handToolButton = true,
        openFileButton = true,
        pagingButtons = true,
        presentationModeButton = true,
        printButton = true,
        propertiesButton = true,
        rotateButton = true,
        secondaryToolbarButton = true,
        sidebarButton = true,
        zoomButtons = true,
        zoomDropdown = true
    }: PdfViewerToolbarButtonsParameters = {}) {
        this.downloadButton = downloadButton;
        this.findButton = findButton;
        this.handToolButton = handToolButton;
        this.openFileButton = openFileButton;
        this.pagingButtons = pagingButtons;
        this.presentationModeButton = presentationModeButton;
        this.printButton = printButton;
        this.propertiesButton = propertiesButton;
        this.rotateButton = rotateButton;
        this.secondaryToolbarButton = secondaryToolbarButton;
        this.sidebarButton = sidebarButton;
        this.zoomButtons = zoomButtons;
        this.zoomDropdown = zoomDropdown;
    }
}
