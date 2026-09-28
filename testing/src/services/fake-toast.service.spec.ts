import { TestBed } from '@angular/core/testing';

import { FakeToastService } from './fake-toast.service';

describe('FakeToastService', () => {
    let toast: FakeToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [FakeToastService] });
        toast = TestBed.inject(FakeToastService);
    });

    it('records every toast it is asked to show, by kind', () => {
        toast.showError({ message: 'save.failed', title: 'save.title' });
        toast.showInfo({ message: 'sync.started' });
        toast.showSuccess({ duration: 1000, message: 'save.done' });
        toast.showWarning({ message: 'save.stale' });
        toast.showWarning({ message: 'quota.near' });

        expect(toast.errors()).toEqual([{ message: 'save.failed', title: 'save.title' }]);
        expect(toast.infos()).toEqual([{ message: 'sync.started' }]);
        expect(toast.successes()).toEqual([{ duration: 1000, message: 'save.done' }]);
        expect(toast.warnings()).toEqual([{ message: 'save.stale' }, { message: 'quota.near' }]);
    });
});
