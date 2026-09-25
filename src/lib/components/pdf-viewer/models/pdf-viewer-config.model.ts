import {
    PdfViewerLoaded,
    PdfViewerLoadingFailed,
    PdfViewerPageRendered,
    PdfViewerRotationChange
} from '../types/pdf-viewer-events';
import { PdfViewerRotation, PdfViewerSource, PdfViewerZoom } from '../types/pdf-viewer-value';
import { PdfViewerToolbarButtons } from './pdf-viewer-toolbar-buttons.model';

/** What the consumer can do to the live viewer, delivered through `onReady`. */
export interface PdfViewerHandle {
    currentPage(): number;
    currentRotation(): PdfViewerRotation;
    currentZoom(): PdfViewerZoom;
    goToPage(page: number): void;
    rotate(rotation: PdfViewerRotation): void;
    setZoom(zoom: PdfViewerZoom): void;
}

export interface PdfViewerConfigParameters {
    src: PdfViewerSource;

    backgroundColor?: string;
    filenameForDownload?: string;
    height?: string;
    maxZoom?: number;
    minZoom?: number;
    onClick?: (event: MouseEvent) => void;
    onLoaded?: (event: PdfViewerLoaded) => void;
    onLoadingFailed?: (event: PdfViewerLoadingFailed) => void;
    onPageChange?: (page: number) => void;
    onPageRendered?: (event: PdfViewerPageRendered) => void;
    onReady?: (handle: PdfViewerHandle) => void;
    onRotationChange?: (event: PdfViewerRotationChange) => void;
    /** The zoom factor the viewer settles on, as a fraction. */
    onZoomChange?: (zoom: number) => void;
    page?: number;
    password?: string;
    rotation?: PdfViewerRotation;
    showToolbar?: boolean;
    toolbarButtons?: PdfViewerToolbarButtons;
    zoom?: PdfViewerZoom;
}

// pdf.js themes its own background off the OS `prefers-color-scheme`, not this app's `body.dark` toggle;
// a token as the default keeps the viewer in sync with the theme, and a literal colour still overrides it.
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
        toolbarButtons = new PdfViewerToolbarButtons(),
        zoom = 'auto',
        ...callbacks
    }: PdfViewerConfigParameters) {
        Object.assign(this, callbacks);
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
        this.toolbarButtons = toolbarButtons;
        this.zoom = zoom;
    }
}
