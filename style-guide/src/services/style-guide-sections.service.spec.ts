import { TestBed } from '@angular/core/testing';

import { StyleGuideSectionsService } from './style-guide-sections.service';

const STORAGE_KEY = 'bey-style-guide-open-sections';

describe('StyleGuideSectionsService', () => {
    function reload(): StyleGuideSectionsService {
        TestBed.resetTestingModule();

        return TestBed.inject(StyleGuideSectionsService);
    }

    beforeEach(() => {
        sessionStorage.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('starts with every section closed', () => {
        const service = TestBed.inject(StyleGuideSectionsService);

        expect(service.openKeys()).toEqual([]);
        expect(service.isOpen('tabs')).toBe(false);
    });

    it('opens and closes a section on each toggle', () => {
        const service = TestBed.inject(StyleGuideSectionsService);

        service.toggle('tabs');
        service.toggle('tree');

        expect(service.openKeys()).toEqual(['tabs', 'tree']);

        service.toggle('tabs');

        expect(service.isOpen('tabs')).toBe(false);
        expect(service.openKeys()).toEqual(['tree']);
    });

    it('opens a section once, however many times it is asked', () => {
        const service = TestBed.inject(StyleGuideSectionsService);

        service.open('tabs');
        service.open('tabs');

        expect(service.openKeys()).toEqual(['tabs']);
    });

    it('expands every section it is given and collapses them all', () => {
        const service = TestBed.inject(StyleGuideSectionsService);

        service.open('tabs');
        service.expandAll(['badge', 'tabs', 'tree']);

        expect(service.openKeys()).toEqual(['badge', 'tabs', 'tree']);

        service.collapseAll();

        expect(service.openKeys()).toEqual([]);
    });

    it('remembers the open sections for the rest of the session', () => {
        TestBed.inject(StyleGuideSectionsService).expandAll(['badge', 'tabs']);
        TestBed.inject(StyleGuideSectionsService).toggle('badge');

        expect(reload().openKeys()).toEqual(['tabs']);
        expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(['tabs']);
    });

    it.each([
        ['broken text', '{', []],
        ['something other than a list', '{"tabs":true}', []],
        ['entries other than keys', '["tabs",3,null]', ['tabs']]
    ])('keeps only the keys it can read when the session holds %s', (_, stored, expected) => {
        sessionStorage.setItem(STORAGE_KEY, stored);

        expect(reload().openKeys()).toEqual(expected);
    });

    it('keeps working when the session refuses to store', () => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        const service = TestBed.inject(StyleGuideSectionsService);

        service.toggle('tabs');

        expect(service.isOpen('tabs')).toBe(true);
    });
});
