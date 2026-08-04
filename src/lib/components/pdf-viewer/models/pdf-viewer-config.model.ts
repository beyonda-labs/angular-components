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

export class PdfViewerConfig {
    height: string;
    maxZoom: number;
    minZoom: number;
    page: number;
    rotation: PdfViewerRotation;
    showToolbar: boolean;
    src: PdfViewerSource;
    toolbarButtons: PdfViewerToolbarButtons;
    zoom: PdfViewerZoom;

    backgroundColor?: string;
    filenameForDownload?: string;
    password?: string;

    constructor({
        backgroundColor,
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
