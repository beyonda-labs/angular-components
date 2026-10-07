import { TestBed } from '@angular/core/testing';

import { TableColumnsStorageService } from './table-columns-storage.service';

describe('TableColumnsStorageService', () => {
    let service: TableColumnsStorageService;

    beforeEach(() => {
        service = TestBed.inject(TableColumnsStorageService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    it('keeps the choices of a table under its key and forgets them on remove', () => {
        expect(service.save({ role: false }, 'people')).toBe(true);
        expect(service.load('people')).toEqual({ role: false });
        expect(service.load('teams')).toEqual({});

        expect(service.remove('people')).toBe(true);
        expect(service.load('people')).toEqual({});
    });

    it('keeps nothing for a table without a key', () => {
        expect(service.save({ role: false })).toBe(false);
        expect(service.remove()).toBe(false);
        expect(service.load()).toEqual({});
    });

    it('falls back to no choice when the storage cannot be used', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('denied');
        });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('denied');
        });
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('denied');
        });

        expect(service.load('people')).toEqual({});
        expect(service.save({ role: false }, 'people')).toBe(false);
        expect(service.remove('people')).toBe(false);
    });

    it('ignores a stored value that is not a set of choices', () => {
        localStorage.setItem('bey-table-columns.people', '["role"]');

        expect(service.load('people')).toEqual({});
    });
});
