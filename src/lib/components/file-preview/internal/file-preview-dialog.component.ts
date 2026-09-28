import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { PdfViewerConfig } from '../../pdf-viewer/models/pdf-viewer-config.model';
import { PdfViewerToolbarButtons } from '../../pdf-viewer/models/pdf-viewer-toolbar-buttons.model';
import { PdfViewerToolbar } from '../../pdf-viewer/models/pdf-viewer-value.model';
import { PdfViewerComponent } from '../../pdf-viewer/pdf-viewer.component';
import { FilePreviewConfig, FilePreviewContent, FilePreviewType } from '../models/file-preview.model';
import { FILE_PREVIEW_CONFIG, FILE_PREVIEW_TITLE_ID } from './file-preview-dialog.token';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PdfViewerComponent, TranslateModule],
    selector: 'bey-file-preview-dialog',
    standalone: true,
    styleUrls: ['./file-preview-dialog.component.css'],
    templateUrl: './file-preview-dialog.component.html'
})
export class FilePreviewDialogComponent implements OnDestroy {
    readonly alt = computed(() => this.config.alt ?? this.config.title);

    readonly config = inject(FILE_PREVIEW_CONFIG);
    readonly imageSource = this.config.type === FilePreviewType.Image ? toImageSource(this.config.content) : null;
    readonly isPdf = computed(() => this.config.type === FilePreviewType.Pdf);
    readonly titleId = FILE_PREVIEW_TITLE_ID;
    readonly viewerConfig = computed(() => (this.isPdf() ? buildViewerConfig(this.config) : null));

    private readonly bsModalReference = inject<BsModalRef<FilePreviewDialogComponent>>(BsModalRef);

    ngOnDestroy(): void {
        if (this.imageSource && this.config.content instanceof Blob) {
            URL.revokeObjectURL(this.imageSource);
        }
    }

    close(): void {
        this.bsModalReference.hide();
    }
}

function buildViewerConfig(config: FilePreviewConfig): PdfViewerConfig {
    return new PdfViewerConfig({
        filenameForDownload: config.fileName,
        src: config.content,
        toolbar: PdfViewerToolbar.Full,
        toolbarButtons: new PdfViewerToolbarButtons({ openFileButton: false })
    });
}

function toImageSource(content: FilePreviewContent): string {
    return content instanceof Blob ? URL.createObjectURL(content) : content;
}
