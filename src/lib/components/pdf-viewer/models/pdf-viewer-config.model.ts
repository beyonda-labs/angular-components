import { PdfViewerRotation, PdfViewerSource, PdfViewerZoom } from '../types/pdf-viewer-value';
import { PdfViewerToolbarButtons, PdfViewerToolbarButtonsParameters } from './pdf-viewer-toolbar-buttons.model';

export interface PdfViewerConfigParameters {
    src: PdfViewerSource;

    backgroundColor?: string;
    filenameForDownload?: string;
    height?: string;
    maxZoom?: number;
    minZoom?: number;
    page?: number;
    password?: string;
    rotation?: PdfViewerRotation;
    showToolbar?: boolean;
    toolbarButtons?: PdfViewerToolbarButtonsParameters | PdfViewerToolbarButtons;
    zoom?: PdfViewerZoom;
}

// pdf.js's own container background is `light-dark()`-themed off the OS `prefers-color-scheme`, not
// this app's `body.dark` toggle, so it never matched the rest of the UI. `backgroundColor` binds
// straight to the viewer's `[style.backgroundColor]`, and a CSS custom property is a valid value there
// — so defaulting to this token keeps the viewer in sync with the app's actual theme with no extra
// wiring, while a consumer can still override it with a literal color for a one-off case.
const DEFAULT_BACKGROUND_COLOR = 'var(--bey-bg-surface)';

export class PdfViewerConfig {
    backgroundColor: string;
    height: string;
    maxZoom: number;
    minZoom: number;
    page: number;
    rotation: PdfViewerRotation;
    showToolbar: boolean;
    src: PdfViewerSource;
    toolbarButtons: PdfViewerToolbarButtons;
    zoom: PdfViewerZoom;

    filenameForDownload?: string;
    password?: string;

    constructor({
        backgroundColor = DEFAULT_BACKGROUND_COLOR,
        filenameForDownload,
        height = '100%',
        maxZoom = 10,
        minZoom = 0.1,
        page = 1,
        password,
        rotation = 0,
        showToolbar = false,
        src,
        toolbarButtons = {},
        zoom = 'auto'
    }: PdfViewerConfigParameters) {
        this.backgroundColor = backgroundColor;
        this.filenameForDownload = filenameForDownload;
        this.height = height;
        this.maxZoom = maxZoom;
        this.minZoom = minZoom;
        this.page = page;
        this.password = password;
        this.rotation = rotation;
        this.showToolbar = showToolbar;
        this.src = src;
        this.toolbarButtons =
            toolbarButtons instanceof PdfViewerToolbarButtons ? toolbarButtons : new PdfViewerToolbarButtons(toolbarButtons);
        this.zoom = zoom;
    }
}
