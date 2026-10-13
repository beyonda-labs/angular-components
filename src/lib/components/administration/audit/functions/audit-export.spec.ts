import { auditExportFileName, saveAuditExport } from './audit-export';

describe('audit export', () => {
    const createObjectURL = jest.fn<string, [Blob]>(() => 'blob:audit');
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

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('names the file after the day it is exported', () => {
        expect(auditExportFileName(new Date(2026, 0, 5, 23, 59))).toBe('audit-20260105.csv');
        expect(auditExportFileName(new Date(2026, 10, 25))).toBe('audit-20261125.csv');
    });

    it('names the file after today when no day is given', () => {
        jest.useFakeTimers({ now: new Date(2026, 9, 13, 8, 30) });

        expect(auditExportFileName()).toBe('audit-20261013.csv');
    });

    it('saves the CSV through an object URL it releases afterwards', () => {
        const content = new Blob(['id,action\n'], { type: 'text/csv' });

        saveAuditExport(content, new Date(2026, 9, 13));

        expect(createObjectURL).toHaveBeenCalledWith(content);
        expect(saved).toEqual([{ download: 'audit-20261013.csv', href: 'blob:audit' }]);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:audit');
    });
});
