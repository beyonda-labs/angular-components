import { TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { FilePreviewDialogComponent } from '../internal/file-preview-dialog.component';
import { FILE_PREVIEW_CONFIG } from '../internal/file-preview-dialog.token';
import { FilePreviewConfig, FilePreviewType } from '../models/file-preview.model';
import { FilePreviewService } from './file-preview.service';

describe('FilePreviewService', () => {
    let service: FilePreviewService;

    const show = jest.fn();

    beforeEach(() => {
        show.mockReset();

        TestBed.configureTestingModule({
            providers: [{ provide: BsModalService, useValue: { show } }]
        });

        service = TestBed.inject(FilePreviewService);
    });

    it('opens the preview as a large centred dialog named by its title, and returns its reference', () => {
        const reference = { hide: jest.fn() } as unknown as BsModalRef<FilePreviewDialogComponent>;
        const config = new FilePreviewConfig({ content: 'logo.png', title: 'Logo', type: FilePreviewType.Image });
        show.mockReturnValue(reference);

        const result = service.open(config);

        expect(result).toBe(reference);
        expect(show).toHaveBeenCalledWith(
            FilePreviewDialogComponent,
            expect.objectContaining({
                ariaLabelledBy: 'bey-file-preview-title',
                class: 'modal-dialog-centered modal-xl',
                providers: [{ provide: FILE_PREVIEW_CONFIG, useValue: config }]
            })
        );
    });
});
