import { formatBytes } from './file-size';

describe('formatBytes', () => {
    it('writes a size below one kilobyte in whole bytes', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(1023)).toBe('1023 B');
    });

    it('moves to the next unit every 1024, with one decimal below 100', () => {
        expect(formatBytes(1024)).toBe('1.0 KB');
        expect(formatBytes(1536)).toBe('1.5 KB');
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
        expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB');
    });

    it('drops the decimal from 100 of a unit up', () => {
        expect(formatBytes(100 * 1024)).toBe('100 KB');
        expect(formatBytes(512.4 * 1024 * 1024)).toBe('512 MB');
    });

    it('stays in gigabytes past the last unit', () => {
        expect(formatBytes(2048 * 1024 * 1024 * 1024)).toBe('2048 GB');
    });

    it('returns an empty string when there is no size', () => {
        expect(formatBytes(null)).toBe('');
        expect(formatBytes()).toBe('');
    });
});
