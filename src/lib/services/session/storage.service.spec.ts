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

    describe('set and get', () => {
        it('returns a stored string', () => {
            service.set('key', 'hello');

            expect(service.get<string>('key')).toBe('hello');
        });

        it('returns a stored object', () => {
            const data = { name: 'John', age: 30 };

            service.set('user', data);

            expect(service.get<typeof data>('user')).toEqual(data);
        });

        it('returns a stored array', () => {
            const items = [1, 2, 3];

            service.set('items', items);

            expect(service.get<number[]>('items')).toEqual(items);
        });

        it('returns a stored boolean', () => {
            service.set('flag', true);

            expect(service.get<boolean>('flag')).toBe(true);
        });

        it('returns a stored number', () => {
            service.set('count', 42);

            expect(service.get<number>('count')).toBe(42);
        });
    });

    describe('get', () => {
        it('returns null for a key that was never stored', () => {
            expect(service.get('missing')).toBeNull();
        });

        it('returns null when the stored value is not valid JSON', () => {
            localStorage.setItem('broken', '{invalid json}');

            expect(service.get('broken')).toBeNull();
        });
    });

    describe('remove', () => {
        it('removes a stored value', () => {
            service.set('key', 'value');

            service.remove('key');

            expect(service.get('key')).toBeNull();
        });

        it('does not throw when removing a key that was never stored', () => {
            expect(() => service.remove('missing')).not.toThrow();
        });
    });

    describe('clear', () => {
        it('removes every stored value', () => {
            service.set('key1', 'value1');
            service.set('key2', 'value2');

            service.clear();

            expect(service.get('key1')).toBeNull();
            expect(service.get('key2')).toBeNull();
        });
    });
});
