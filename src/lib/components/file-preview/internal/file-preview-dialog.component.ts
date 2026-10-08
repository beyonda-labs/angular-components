import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileImage, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ButtonComponent } from '../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../internal/button/models/button-config.model';
import { PdfViewerConfig } from '../../pdf-viewer/models/pdf-viewer-config.model';
import { PdfViewerToolbar } from '../../pdf-viewer/models/pdf-viewer-value.model';
import { PdfViewerComponent } from '../../pdf-viewer/pdf-viewer.component';
import { FilePreviewConfig, FilePreviewContent, FilePreviewType } from '../models/file-preview.model';
import { FILE_PREVIEW_CONFIG, FILE_PREVIEW_TITLE_ID } from './file-preview-dialog.token';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, PdfViewerComponent, TranslateModule],
    selector: 'bey-file-preview-dialog',
    standalone: true,
    styleUrls: ['./file-preview-dialog.component.css'],
    templateUrl: './file-preview-dialog.component.html'
})
export class FilePreviewDialogComponent implements OnDestroy {
    private readonly bsModalReference = inject<BsModalRef<FilePreviewDialogComponent>>(BsModalRef);
    readonly config = inject(FILE_PREVIEW_CONFIG);

    readonly alt = computed(() => this.config.alt ?? this.config.title);
    readonly cancelButton = new ButtonConfig({
        action: () => this.close(),
        label: 'angular-components.file-preview.cancel',
        type: ButtonType.Secondary
    });
    readonly icon = computed(() => (this.isPdf() ? faFilePdf : faFileImage));
    readonly imageSource = this.config.type === FilePreviewType.Image ? toImageSource(this.config.content) : null;
    readonly isPdf = computed(() => this.config.type === FilePreviewType.Pdf);
    readonly titleId = FILE_PREVIEW_TITLE_ID;
    readonly typeLabel = 'angular-components.file-preview.type';
    readonly viewerConfig = computed(() => (this.isPdf() ? buildViewerConfig(this.config) : null));

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
        isDownloadable: true,
        isSearchable: true,
        src: config.content,
        toolbar: PdfViewerToolbar.Compact
    });
}

function toImageSource(content: FilePreviewContent): string {
    return content instanceof Blob ? URL.createObjectURL(content) : content;
}
