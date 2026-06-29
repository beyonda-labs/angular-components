import { TestBed } from '@angular/core/testing';

import { AppLayoutBreadcrumbItem } from '../models/app-layout.model';
import { AppLayoutService } from './app-layout.service';

describe('AppLayoutService', () => {
    let service: AppLayoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppLayoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('breadcrumbItems$', () => {
        it('should emit empty array by default', done => {
            service.breadcrumbItems$.subscribe(items => {
                expect(items).toEqual([]);
                done();
            });
        });

        it('should emit items after setBreadcrumb', done => {
            const items = [
                new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
                new AppLayoutBreadcrumbItem({ id: 2, label: 'Products' })
            ];

            service.setBreadcrumb(items);

            service.breadcrumbItems$.subscribe(result => {
                expect(result).toEqual(items);
                done();
            });
        });

        it('should emit empty array after clearBreadcrumb', done => {
            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })]);
            service.clearBreadcrumb();

            service.breadcrumbItems$.subscribe(items => {
                expect(items).toEqual([]);
                done();
            });
        });

        it('should emit latest value on multiple setBreadcrumb calls', done => {
            const firstItems = [new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })];
            const secondItems = [new AppLayoutBreadcrumbItem({ id: 2, label: 'Settings' })];

            service.setBreadcrumb(firstItems);
            service.setBreadcrumb(secondItems);

            service.breadcrumbItems$.subscribe(items => {
                expect(items).toEqual(secondItems);
                done();
            });
        });
    });

    describe('onBreadcrumbClick$', () => {
        it('should emit the id when emitBreadcrumbClick is called', done => {
            service.onBreadcrumbClick$.subscribe(clicked => {
                expect(clicked).toBe(5);
                done();
            });

            service.emitBreadcrumbClick(5);
        });

        it('should not emit before emitBreadcrumbClick is called', () => {
            const spy = jest.fn();
            service.onBreadcrumbClick$.subscribe(spy);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('onMenuClick$', () => {
        it('should emit the key when emitMenuClick is called', done => {
            service.onMenuClick$.subscribe(clicked => {
                expect(clicked).toBe('dashboard');
                done();
            });

            service.emitMenuClick('dashboard');
        });

        it('should not emit before emitMenuClick is called', () => {
            const spy = jest.fn();
            service.onMenuClick$.subscribe(spy);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('activeAction$', () => {
        it('should emit the action key when activeMenuAction is called', done => {
            service.activeAction$.subscribe(key => {
                expect(key).toBe('settings');
                done();
            });

            service.activeMenuAction('settings');
        });

        it('should not emit before activeMenuAction is called', () => {
            const spy = jest.fn();
            service.activeAction$.subscribe(spy);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});
