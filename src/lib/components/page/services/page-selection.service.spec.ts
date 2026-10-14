import { TestBed } from '@angular/core/testing';

import { PageSelectionService } from './page-selection.service';

describe('PageSelectionService', () => {
    let service: PageSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PageSelectionService] });
        service = TestBed.inject(PageSelectionService);
    });

    it('holds the selected rows, tells them apart by id and clears them', () => {
        service.select([{ id: 1 }, { id: 2 }]);
        const selected = [service.selected(), service.isSelected({ id: 2 }), service.isSelected({ id: 3 })];
        service.clear();

        expect(selected).toEqual([[{ id: 1 }, { id: 2 }], true, false]);
        expect(service.selected()).toEqual([]);
    });

    it('keeps of the selection the rows a new list still holds, as the list answers them', () => {
        service.select([{ id: 1 }, { id: 2 }]);

        expect(service.keepListed([{ actions: ['edit'], id: 2 }, { id: 3 }])).toEqual([{ actions: ['edit'], id: 2 }]);
    });
});
