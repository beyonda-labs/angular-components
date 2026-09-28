import { inject, Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { FilePreviewDialogComponent } from '../internal/file-preview-dialog.component';
import { FILE_PREVIEW_CONFIG, FILE_PREVIEW_TITLE_ID } from '../internal/file-preview-dialog.token';
import { FilePreviewConfig } from '../models/file-preview.model';

@Injectable({
    providedIn: 'root'
})
export class FilePreviewService {
    private readonly bsModalService = inject(BsModalService);

    open(config: FilePreviewConfig): BsModalRef<FilePreviewDialogComponent> {
        return this.bsModalService.show(FilePreviewDialogComponent, {
            animated: true,
            ariaLabelledBy: FILE_PREVIEW_TITLE_ID,
            class: 'modal-dialog-centered modal-xl',
            providers: [{ provide: FILE_PREVIEW_CONFIG, useValue: config }]
        });
    }
}
