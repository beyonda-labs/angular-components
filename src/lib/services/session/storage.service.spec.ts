import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [StorageService]
        });

        service = TestBed.inject(StorageService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('set and get', () => {
        it('should store and retrieve a string value', () => {
            service.set('key', 'hello');

            expect(service.get<string>('key')).toBe('hello');
        });

        it('should store and retrieve an object', () => {
            const data = { name: 'John', age: 30 };

            service.set('user', data);

            expect(service.get<typeof data>('user')).toEqual(data);
        });

        it('should store and retrieve an array', () => {
            const items = [1, 2, 3];

            service.set('items', items);

            expect(service.get<number[]>('items')).toEqual(items);
        });

        it('should store and retrieve a boolean', () => {
            service.set('flag', true);

            expect(service.get<boolean>('flag')).toBe(true);
        });

        it('should store and retrieve a number', () => {
            service.set('count', 42);

            expect(service.get<number>('count')).toBe(42);
        });
    });

    describe('get', () => {
        it('should return null for non-existent key', () => {
            expect(service.get('missing')).toBeNull();
        });

        it('should return null for invalid JSON', () => {
            localStorage.setItem('broken', '{invalid json}');

            expect(service.get('broken')).toBeNull();
        });
    });

    describe('remove', () => {
        it('should remove a stored value', () => {
            service.set('key', 'value');

            service.remove('key');

            expect(service.get('key')).toBeNull();
        });

        it('should not throw when removing a non-existent key', () => {
            expect(() => service.remove('missing')).not.toThrow();
        });
    });

    describe('clear', () => {
        it('should remove all stored values', () => {
            service.set('key1', 'value1');
            service.set('key2', 'value2');

            service.clear();

            expect(service.get('key1')).toBeNull();
            expect(service.get('key2')).toBeNull();
        });
    });
});
