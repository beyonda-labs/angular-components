import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent } from '@testing/dom';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { PdfViewerConfig } from '../../pdf-viewer/models/pdf-viewer-config.model';
import { PdfViewerToolbar } from '../../pdf-viewer/models/pdf-viewer-value.model';
import { PdfViewerComponent } from '../../pdf-viewer/pdf-viewer.component';
import { FilePreviewConfig, FilePreviewConfigParameters, FilePreviewType } from '../models/file-preview.model';
import { FilePreviewDialogComponent } from './file-preview-dialog.component';
import { FILE_PREVIEW_CONFIG } from './file-preview-dialog.token';

describe('FilePreviewDialogComponent', () => {
    let config: FilePreviewConfig;
    let fixture: ComponentFixture<FilePreviewDialogComponent>;

    const content = new Blob(['logo'], { type: 'image/png' });
    const createObjectURL = jest.fn();
    const hide = jest.fn();
    const revokeObjectURL = jest.fn();

    function buildConfig(overrides: Partial<FilePreviewConfigParameters> = {}): FilePreviewConfig {
        return new FilePreviewConfig({
            content,
            fileName: 'logo.png',
            title: 'Company logo',
            type: FilePreviewType.Image,
            ...overrides
        });
    }

    function image(): HTMLImageElement | null {
        return fixture.nativeElement.querySelector('img');
    }

    async function render(overrides: Partial<FilePreviewConfigParameters> = {}): Promise<void> {
        config = buildConfig(overrides);
        fixture = await renderComponent(FilePreviewDialogComponent);
    }

    function viewerConfig(): PdfViewerConfig | undefined {
        return fixture.debugElement.query(By.css('bey-pdf-viewer'))?.properties['config'];
    }

    beforeEach(async () => {
        createObjectURL.mockReset();
        createObjectURL.mockReturnValue('blob:preview');
        hide.mockReset();
        revokeObjectURL.mockReset();
        URL.createObjectURL = createObjectURL;
        URL.revokeObjectURL = revokeObjectURL;

        await TestBed.configureTestingModule({
            imports: [FilePreviewDialogComponent, TranslateModule.forRoot()],
            providers: [
                { provide: BsModalRef, useValue: { hide } },
                { provide: FILE_PREVIEW_CONFIG, useFactory: () => config }
            ]
        })
            .overrideComponent(FilePreviewDialogComponent, {
                add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
                remove: { imports: [PdfViewerComponent] }
            })
            .compileComponents();
    });

    it('shows the title and the file name', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Company logo');
        expect(fixture.nativeElement.textContent).toContain('logo.png');
    });

    it('shows an image from an object URL of the blob, described by the title', async () => {
        await render();

        expect(createObjectURL).toHaveBeenCalledWith(content);
        expect(image()?.getAttribute('src')).toBe('blob:preview');
        expect(image()?.getAttribute('alt')).toBe('Company logo');
    });

    it('describes the image with its own alternative text when the config gives one', async () => {
        await render({ alt: 'Logo in colour' });

        expect(image()?.getAttribute('alt')).toBe('Logo in colour');
    });

    it('shows an image from a URL as it is', async () => {
        await render({ content: 'https://example.com/logo.png' });

        expect(image()?.getAttribute('src')).toBe('https://example.com/logo.png');
        expect(createObjectURL).not.toHaveBeenCalled();
    });

    it('releases the object URL it created once it is destroyed', async () => {
        await render();

        fixture.destroy();

        expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    });

    it('leaves a URL it was given alone once it is destroyed', async () => {
        await render({ content: 'https://example.com/logo.png' });

        fixture.destroy();

        expect(revokeObjectURL).not.toHaveBeenCalled();
    });

    it('shows a PDF in the viewer with its own toolbar and the file name for downloading', async () => {
        await render({ fileName: 'invoice.pdf', type: FilePreviewType.Pdf });

        expect(image()).toBeNull();
        expect(createObjectURL).not.toHaveBeenCalled();
        expect(viewerConfig()?.src).toBe(content);
        expect(viewerConfig()?.filenameForDownload).toBe('invoice.pdf');
        expect(viewerConfig()?.toolbar).toBe(PdfViewerToolbar.Full);
    });

    it('closes from the labelled close button', async () => {
        await render();

        buttonByName(fixture, 'angular-components.file-preview.close').click();

        expect(hide).toHaveBeenCalledTimes(1);
    });
});
