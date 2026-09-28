import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
    let service: LoadingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LoadingService]
        });

        service = TestBed.inject(LoadingService);
    });

    it('is not loading initially', () => {
        expect(service.isLoading()).toBe(false);
    });

    it('is loading after show()', () => {
        service.show();

        expect(service.isLoading()).toBe(true);
    });

    it('stops loading after a matching hide()', () => {
        service.show();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('keeps loading while show() has been called more times than hide()', () => {
        service.show();
        service.show();
        service.hide();

        expect(service.isLoading()).toBe(true);
    });

    it('stops loading once every show() is matched by a hide()', () => {
        service.show();
        service.show();
        service.show();
        service.hide();
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('stays idle when hide() is called without show()', () => {
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('does not go below zero when hide() is called more times than show()', () => {
        service.show();
        service.hide();
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);

        service.show();

        expect(service.isLoading()).toBe(true);
    });

    it('stops loading on reset() whatever the count', () => {
        service.show();
        service.show();
        service.show();
        service.reset();

        expect(service.isLoading()).toBe(false);
    });

    it('counts from zero again after reset()', () => {
        service.show();
        service.show();
        service.reset();
        service.show();

        expect(service.isLoading()).toBe(true);

        service.hide();

        expect(service.isLoading()).toBe(false);
    });
});
