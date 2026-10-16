import { TestBed } from '@angular/core/testing';

import { PageViewMode } from '../models/page-categories.model';
import { PageView } from '../models/page-view.model';
import { PageViewService } from './page-view.service';

const CLIENTS = { id: 'clients', label: 'Clients' };
const HOME = { id: 'home', label: 'Home' };
const ACME = { id: 'acme', label: 'Acme' };

describe('PageViewService', () => {
    let service: PageViewService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PageViewService] });
        service = TestBed.inject(PageViewService);
    });

    it('starts at the root of the main tab', () => {
        expect([service.activeTab(), service.currentCategory(), service.location()]).toEqual(['table', null, 'table:']);
    });

    it('opens a folder with its path and walks the breadcrumb back up', () => {
        service.enterCategory([HOME, CLIENTS], 'clients', null);
        const inside = [service.currentCategory(), service.location()];
        service.goUpTo(1);
        const above = service.currentCategory();
        service.goUpTo(0);

        expect(inside).toEqual([CLIENTS, 'table:clients']);
        expect(above).toEqual(HOME);
        expect([service.categoryPath(), service.currentCategoryId()]).toEqual([[], null]);
    });

    it('cuts the path of a shared folder at the shared folder, and names it as the shared root', () => {
        service.setViewMode(PageViewMode.Shared);
        const atRoot = [service.isAtSharedRoot(), service.sharedRootIdFor({ id: 'clients' })];
        service.enterCategory([HOME, CLIENTS], 'clients', 'clients');
        const rootIdInside = service.sharedRootIdFor({ id: 'acme' });
        service.enterCategory([HOME, CLIENTS, ACME], 'acme', rootIdInside);

        expect(atRoot).toEqual([true, 'clients']);
        expect([service.isAtSharedRoot(), service.sharedRoot(), service.categoryPath()]).toEqual([
            false,
            CLIENTS,
            [CLIENTS, ACME]
        ]);
    });

    it('starts at the root when going between the shared tab and the others, and keeps the folder otherwise', () => {
        service.enterCategory([HOME], 'home', null);
        service.setViewMode(PageViewMode.Trash);
        const inTrash = service.currentCategoryId();
        service.setViewMode(PageViewMode.Shared);

        expect(inTrash).toBe('home');
        expect([service.currentCategoryId(), service.sharedRootIdFor({ id: 'clients' })]).toEqual([null, 'clients']);
    });

    it('selects a view as a tab of its own, in the main view mode', () => {
        service.selectView(new PageView({ filters: [], key: 'blocks' }), PageViewMode.Table);

        expect([service.activeTab(), service.activeView(), service.viewMode()]).toEqual([
            'blocks',
            'blocks',
            PageViewMode.Table
        ]);
    });

    it('hides the folder while a view with a list URL of its own is open, keeps it, and gives it back on leaving', () => {
        const queue = new PageView({ baseUrl: '/queue', filters: [], key: 'queue' });
        service.enterCategory([HOME, CLIENTS], 'clients', null);
        service.selectView(queue, PageViewMode.Table);
        const inView = [service.flatView(), service.categoryPath(), service.currentCategory(), service.location()];
        const kept = service.toState();
        service.selectView(null, PageViewMode.Table);

        expect(inView).toEqual([queue, [], null, 'queue:']);
        expect(kept).toEqual({
            categoryPath: [HOME, CLIENTS],
            currentCategoryId: 'clients',
            view: 'queue',
            viewMode: PageViewMode.Table
        });
        expect([service.flatView(), service.currentCategory()]).toEqual([null, CLIENTS]);
    });

    it('restores a state, dropping a view the page no longer has', () => {
        const state = {
            categoryPath: [HOME],
            currentCategoryId: 'home',
            search: { filters: [], page: 1, size: 25 },
            selected: [],
            sort: null,
            view: 'gone',
            viewMode: PageViewMode.Trash
        };

        service.restore(state, [new PageView({ filters: [], key: 'blocks' })]);
        const withoutView = [service.activeView(), service.viewMode(), service.currentCategory()];
        service.restore({ ...state, view: 'blocks' }, [new PageView({ filters: [], key: 'blocks' })]);

        expect(withoutView).toEqual([null, PageViewMode.Trash, HOME]);
        expect(service.activeView()).toBe('blocks');
    });
});
