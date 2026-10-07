import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { PageViewMode } from '../models/page-categories.model';
import { PageState } from '../models/page-state.model';
import { PageStateService } from './page-state.service';

function buildState(overrides: Partial<PageState> = {}): PageState {
    return {
        categoryPath: [{ id: 'clients', label: 'Clients' }],
        currentCategoryId: 'clients',
        search: { filters: [], page: 2, size: 50 },
        selected: [{ id: 1 }],
        view: null,
        viewMode: PageViewMode.Table,
        ...overrides
    };
}

describe('PageStateService', () => {
    let router: Router;
    let service: PageStateService;
    let path: string;

    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
        router = TestBed.inject(Router);
        service = TestBed.inject(PageStateService);

        await router.navigateByUrl('/templates?tab=all');
        path = service.currentPath();
    });

    it('locates a page by the path of its URL, without its query', () => {
        expect(path).toBe('/templates');
    });

    it('keeps the state of a page left for a route under it, once, for when the page comes back', async () => {
        await router.navigateByUrl('/templates/definition/7');
        service.leave(path, 'demo', buildState());
        await router.navigateByUrl('/templates/definition/8');
        await router.navigateByUrl('/templates');

        expect(service.restore(path, 'demo')).toEqual(buildState());
        expect(service.restore(path, 'demo')).toBeUndefined();
    });

    it('keeps nothing for a page left for a route outside it or for its own URL', async () => {
        await router.navigateByUrl('/templates-archive');
        service.leave(path, 'demo', buildState());
        await router.navigateByUrl('/templates');
        service.leave(path, 'other', buildState());

        expect(service.restore(path, 'demo')).toBeUndefined();
        expect(service.restore(path, 'other')).toBeUndefined();
    });

    it('forgets a kept state once the user navigates outside the page', async () => {
        await router.navigateByUrl('/templates/definition/7');
        service.leave(path, 'demo', buildState());
        await router.navigateByUrl('/documents');
        await router.navigateByUrl('/templates');

        expect(service.restore(path, 'demo')).toBeUndefined();
    });

    it('keeps the states of two pages on the same URL apart by their prefix', async () => {
        await router.navigateByUrl('/templates/definition/7');
        service.leave(path, 'templates', buildState());
        service.leave(path, 'blocks', buildState({ view: 'blocks' }));

        expect(service.restore(path, 'blocks')?.view).toBe('blocks');
        expect(service.restore(path, 'templates')?.view).toBeNull();
    });
});
