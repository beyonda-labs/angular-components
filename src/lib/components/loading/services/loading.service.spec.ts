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

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should not be loading initially', () => {
        expect(service.isLoading()).toBe(false);
    });

    it('should be loading after show()', () => {
        service.show();

        expect(service.isLoading()).toBe(true);
    });

    it('should stop loading after matching hide()', () => {
        service.show();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('should remain loading when show() is called more times than hide()', () => {
        service.show();
        service.show();
        service.hide();

        expect(service.isLoading()).toBe(true);
    });

    it('should stop loading when all show() calls are matched by hide()', () => {
        service.show();
        service.show();
        service.show();
        service.hide();
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero when hide() is called without show()', () => {
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero when hide() is called more times than show()', () => {
        service.show();
        service.hide();
        service.hide();
        service.hide();

        expect(service.isLoading()).toBe(false);

        service.show();

        expect(service.isLoading()).toBe(true);
    });

    it('should reset to zero regardless of current count', () => {
        service.show();
        service.show();
        service.show();
        service.reset();

        expect(service.isLoading()).toBe(false);
    });

    it('should work normally after reset()', () => {
        service.show();
        service.show();
        service.reset();
        service.show();

        expect(service.isLoading()).toBe(true);

        service.hide();

        expect(service.isLoading()).toBe(false);
    });
});
