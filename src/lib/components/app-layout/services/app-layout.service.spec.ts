import { TestBed } from '@angular/core/testing';

import { AppLayoutBreadcrumbItem } from '../models/app-layout.model';
import { AppLayoutService } from './app-layout.service';

describe('AppLayoutService', () => {
    let service: AppLayoutService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppLayoutService);
    });

    it('holds the breadcrumb that was last set, and empties it on clear', () => {
        const items = [new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })];

        expect(service.breadcrumb()).toEqual([]);

        service.setBreadcrumb(items);
        expect(service.breadcrumb()).toBe(items);

        service.clearBreadcrumb();
        expect(service.breadcrumb()).toEqual([]);
    });

    it('holds the active action, and forgets it on clear', () => {
        expect(service.activeActionKey()).toBeNull();

        service.activeMenuAction('settings');
        expect(service.activeActionKey()).toBe('settings');

        service.clearActiveAction();
        expect(service.activeActionKey()).toBeNull();
    });

    it('relays breadcrumb and menu clicks to whoever listens', () => {
        const breadcrumbClicks = jest.fn();
        const menuClicks = jest.fn();
        service.onBreadcrumbClick$.subscribe(breadcrumbClicks);
        service.onMenuClick$.subscribe(menuClicks);

        service.emitBreadcrumbClick(5);
        service.emitMenuClick('dashboard');

        expect(breadcrumbClicks).toHaveBeenCalledWith(5);
        expect(menuClicks).toHaveBeenCalledWith('dashboard');
    });

    it('starts expanded when nothing is stored', () => {
        expect(service.expanded()).toBe(true);
    });

    it('remembers the expanded state across instances', () => {
        service.setExpanded(false);
        expect(service.expanded()).toBe(false);

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});

        expect(TestBed.inject(AppLayoutService).expanded()).toBe(false);
    });

    it('survives a storage that cannot be written', () => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });

        expect(() => service.setExpanded(false)).not.toThrow();
        expect(service.expanded()).toBe(false);
    });
});
