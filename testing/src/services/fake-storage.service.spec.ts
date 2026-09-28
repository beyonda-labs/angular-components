import { TestBed } from '@angular/core/testing';

import { FakeStorageService } from './fake-storage.service';

describe('FakeStorageService', () => {
    let storage: FakeStorageService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [FakeStorageService] });
        storage = TestBed.inject(FakeStorageService);
    });

    it('returns a copy of what was set, and null for a key never set', () => {
        const preferences = { columns: ['name', 'status'] };

        storage.set('preferences', preferences);
        preferences.columns.push('owner');

        expect(storage.get('preferences')).toEqual({ columns: ['name', 'status'] });
        expect(storage.get('missing')).toBeNull();
    });

    it('forgets a removed key and, once cleared, every key', () => {
        storage.set('token', 'abc');
        storage.set('theme', 'dark');

        storage.remove('token');

        expect(storage.get('token')).toBeNull();
        expect(storage.get('theme')).toBe('dark');

        storage.clear();

        expect(storage.get('theme')).toBeNull();
    });

    it('keeps everything in memory, away from localStorage', () => {
        storage.set('token', 'abc');

        expect(localStorage.getItem('token')).toBeNull();
    });
});
