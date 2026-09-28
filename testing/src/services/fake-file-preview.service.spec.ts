import { TestBed } from '@angular/core/testing';
import { BeyFilePreviewConfig, BeyFilePreviewType } from '@beyonda-labs/angular-components';

import { FakeFilePreviewService } from './fake-file-preview.service';

describe('FakeFilePreviewService', () => {
    let filePreview: FakeFilePreviewService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [FakeFilePreviewService] });
        filePreview = TestBed.inject(FakeFilePreviewService);
    });

    it('records the files it is asked to preview', () => {
        const pdf = new BeyFilePreviewConfig({
            content: new Blob(['%PDF']),
            fileName: 'invoice.pdf',
            title: 'Invoice',
            type: BeyFilePreviewType.Pdf
        });
        const image = new BeyFilePreviewConfig({ content: 'logo.png', title: 'Logo', type: BeyFilePreviewType.Image });

        filePreview.open(pdf);
        filePreview.open(image);

        expect(filePreview.previews()).toEqual([pdf, image]);
    });
});
