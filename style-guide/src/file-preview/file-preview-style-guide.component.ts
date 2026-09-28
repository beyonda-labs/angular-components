import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeyFilePreviewConfig, BeyFilePreviewService, BeyFilePreviewType } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.file-preview';
const SAMPLE_IMAGE = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">',
    '<rect width="640" height="360" fill="#e9ecef"/>',
    '<circle cx="320" cy="180" r="96" fill="#495057"/>',
    '</svg>'
].join('');
const SAMPLE_PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-file-preview-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './file-preview-style-guide.component.css'],
    templateUrl: './file-preview-style-guide.component.html'
})
export class FilePreviewStyleGuideComponent {
    private readonly filePreviewService = inject(BeyFilePreviewService);

    previewImage(): void {
        this.filePreviewService.open(
            new BeyFilePreviewConfig({
                alt: `${PREFIX}.image.alt`,
                content: new Blob([SAMPLE_IMAGE], { type: 'image/svg+xml' }),
                fileName: 'sample.svg',
                title: `${PREFIX}.image.title`,
                type: BeyFilePreviewType.Image
            })
        );
    }

    previewPdf(): void {
        this.filePreviewService.open(
            new BeyFilePreviewConfig({
                content: SAMPLE_PDF_URL,
                fileName: 'tracemonkey.pdf',
                title: `${PREFIX}.pdf.title`,
                type: BeyFilePreviewType.Pdf
            })
        );
    }
}
