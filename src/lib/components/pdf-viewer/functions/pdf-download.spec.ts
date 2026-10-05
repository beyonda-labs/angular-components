import { downloadPdf } from './pdf-download';

describe('downloadPdf', () => {
    const createObjectURL = jest.fn<string, [Blob]>(() => 'blob:pdf');
    const revokeObjectURL = jest.fn();
    let saved: { download: string; href: string }[];

    beforeEach(() => {
        saved = [];
        createObjectURL.mockClear();
        revokeObjectURL.mockClear();
        Object.assign(URL, { createObjectURL, revokeObjectURL });
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            saved.push({ download: this.download, href: this.getAttribute('href') ?? '' });
        });
    });

    it('saves a URL as it is, under the given name', () => {
        downloadPdf('data:application/pdf;base64,JVBERi0=', 'invoice.pdf');

        expect(saved).toEqual([{ download: 'invoice.pdf', href: 'data:application/pdf;base64,JVBERi0=' }]);
        expect(createObjectURL).not.toHaveBeenCalled();
    });

    it('saves bytes through an object URL it releases afterwards', () => {
        downloadPdf(new Uint8Array([37, 80, 68, 70]), 'invoice.pdf');

        expect(createObjectURL.mock.calls[0][0].type).toBe('application/pdf');
        expect(saved).toEqual([{ download: 'invoice.pdf', href: 'blob:pdf' }]);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:pdf');
    });
});
