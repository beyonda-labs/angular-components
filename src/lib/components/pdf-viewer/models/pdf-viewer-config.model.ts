import {
    PdfViewerLoaded,
    PdfViewerLoadingFailed,
    PdfViewerPageRendered,
    PdfViewerRotationChange
} from './pdf-viewer-events.model';
import { PdfViewerToolbarButtons } from './pdf-viewer-toolbar-buttons.model';
import { PdfViewerRotation, PdfViewerSource, PdfViewerToolbar, PdfViewerZoom } from './pdf-viewer-value.model';

export interface PdfViewerHandle {
    currentPage(): number;
    currentRotation(): PdfViewerRotation;
    currentZoom(): PdfViewerZoom;
    goToPage(page: number): void;
    rotate(rotation: PdfViewerRotation): void;
    setZoom(zoom: PdfViewerZoom): void;
}

export class PdfViewerConfig {
    backgroundColor: string;
    height: string;
    isDownloadable: boolean;
    maxZoom: number;
    minZoom: number;
    page: number;
    rotation: PdfViewerRotation;
    src: PdfViewerSource;
    toolbar: PdfViewerToolbar;
    toolbarButtons: PdfViewerToolbarButtons;
    zoom: PdfViewerZoom;
    zoomStep: number;

    filenameForDownload?: string;
    onClick?: (event: MouseEvent) => void;
    onLoaded?: (event: PdfViewerLoaded) => void;
    onLoadingFailed?: (event: PdfViewerLoadingFailed) => void;
    onPageChange?: (page: number) => void;
    onPageRendered?: (event: PdfViewerPageRendered) => void;
    onReady?: (handle: PdfViewerHandle) => void;
    onRotationChange?: (event: PdfViewerRotationChange) => void;
    onZoomChange?: (zoom: number) => void;
    password?: string;

    constructor({
        backgroundColor = 'var(--bey-bg-surface)',
        filenameForDownload,
        height = '100%',
        isDownloadable = false,
        maxZoom = 10,
        minZoom = 0.1,
        page = 1,
        password,
        rotation = 0,
        src,
        toolbar = PdfViewerToolbar.None,
        toolbarButtons = new PdfViewerToolbarButtons(),
        zoom = 'auto',
        zoomStep = 0.1,
        ...callbacks
    }: PdfViewerConfigParameters) {
        Object.assign(this, callbacks);
        this.backgroundColor = backgroundColor;
        this.filenameForDownload = filenameForDownload;
        this.height = height;
        this.isDownloadable = isDownloadable;
        this.maxZoom = maxZoom;
        this.minZoom = minZoom;
        this.page = page;
        this.password = password;
        this.rotation = rotation;
        this.src = src;
        this.toolbar = toolbar;
        this.toolbarButtons = toolbarButtons;
        this.zoom = zoom;
        this.zoomStep = zoomStep;
    }
}

export interface PdfViewerConfigParameters {
    src: PdfViewerSource;

    backgroundColor?: string;
    filenameForDownload?: string;
    height?: string;
    isDownloadable?: boolean;
    maxZoom?: number;
    minZoom?: number;
    onClick?: (event: MouseEvent) => void;
    onLoaded?: (event: PdfViewerLoaded) => void;
    onLoadingFailed?: (event: PdfViewerLoadingFailed) => void;
    onPageChange?: (page: number) => void;
    onPageRendered?: (event: PdfViewerPageRendered) => void;
    onReady?: (handle: PdfViewerHandle) => void;
    onRotationChange?: (event: PdfViewerRotationChange) => void;
    onZoomChange?: (zoom: number) => void;
    page?: number;
    password?: string;
    rotation?: PdfViewerRotation;
    toolbar?: PdfViewerToolbar;
    toolbarButtons?: PdfViewerToolbarButtons;
    zoom?: PdfViewerZoom;
    zoomStep?: number;
}
