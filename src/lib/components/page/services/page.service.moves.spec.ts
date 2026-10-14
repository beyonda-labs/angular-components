import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { pageStandardAction } from '../functions/page-standard-actions';
import { PageBackendResponse, PageConfig } from '../models/page.model';
import { PageAction, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from '../models/page-categories.model';
import { PageHeaderConfig } from '../models/page-header.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageService } from './page.service';
import { PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageLinkService } from './page-link.service';
import { PageListService } from './page-list.service';
import { PageOrganizationsService } from './page-organizations.service';
import { PageOwnersService } from './page-owners.service';
import { PageSelectionService } from './page-selection.service';
import { PageViewService } from './page-view.service';

const FOLDER = { actions: ['move'], id: 'folder', parentId: null, type: PageItemType.Category };
const FILE = { actions: ['move'], id: 'file', parentId: null, type: PageItemType.Item };

function buildResponse(results: PageItem[]): PageBackendResponse {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total: results.length } };
}

describe('PageService — drag to move', () => {
    let service: PageService;
    let pageActionsService: MockProxy<PageActionsService>;
    let pageHttpService: MockProxy<PageHttpService>;

    function buildMoveConfig(actions: PageAction[], isTrashEnabled = false): PageConfig {
        return new PageConfig({
            baseUrl: '/items',
            headerConfig: new PageHeaderConfig({ actions }),
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                isTrashEnabled,
                loadRow: () => []
            })
        });
    }

    function flush(): void {
        TestBed.flushEffects();
    }

    beforeEach(() => {
        pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockImplementation(actions => actions);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(buildResponse([FOLDER, FILE])));

        TestBed.configureTestingModule({
            providers: [
                PageLinkService,
                PageListService,
                PageOrganizationsService,
                PageOwnersService,
                PageSelectionService,
                PageService,
                PageViewService,
                provideTranslateService(),
                { provide: PageActionsService, useValue: pageActionsService },
                { provide: PageHttpService, useValue: pageHttpService }
            ]
        });

        service = TestBed.inject(PageService);
    });

    it('lets the rows that may move be dropped onto a folder, through the move of the actions', () => {
        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
        flush();
        service.setSelected([FILE]);
        const table = service.tableConfig();

        expect(table?.isRowDraggable?.(FILE)).toBe(true);
        expect(table?.isDropAllowed?.(FOLDER, [FILE])).toBe(true);
        expect(table?.isDropAllowed?.(FILE, [FOLDER])).toBe(false);

        table?.onRowDrop?.(FOLDER, [FILE]);
        const [context, items, targetId] = pageActionsService.moveItems.mock.calls[0];

        expect(items).toEqual([FILE]);
        expect(targetId).toBe('folder');

        context.onMoved();
        flush();
        expect(service.selected()).toEqual([]);
        expect(pageHttpService.load).toHaveBeenCalledTimes(2);
    });

    it('takes a drop only on a folder of the owner of every dragged row', () => {
        const adaFolder = { ...FOLDER, id: 'ada-folder', ownerId: 'ada', ownerName: 'Ada' };
        const graceFolder = { ...FOLDER, id: 'grace-folder', ownerId: 'grace', ownerName: 'Grace' };
        const adaFile = { ...FILE, id: 'ada-file', ownerId: 'ada', ownerName: 'Ada' };
        const graceFile = { ...FILE, id: 'grace-file', ownerId: 'grace', ownerName: 'Grace' };
        pageHttpService.load.mockReturnValue(of(buildResponse([adaFolder, graceFolder, adaFile, graceFile])));
        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
        flush();
        const table = service.tableConfig();

        expect(table?.isDropAllowed?.(adaFolder, [adaFile])).toBe(true);
        expect(table?.isDropAllowed?.(graceFolder, [adaFile])).toBe(false);
        expect(table?.isDropAllowed?.(graceFolder, [adaFile, graceFile])).toBe(false);
    });

    it('offers no drag without the standard move action, nor in the trash', () => {
        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Delete)]));
        flush();
        expect(service.tableConfig()?.onRowDrop).toBeUndefined();

        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)], true));
        service.setViewMode(PageViewMode.Trash);
        flush();
        expect(service.tableConfig()?.isRowDraggable).toBeUndefined();
    });

    it('lets the rows of a shared folder be dragged onto its folders, and hands the move the shared folder', () => {
        pageHttpService.loadShared.mockReturnValue(of(buildResponse([FOLDER])));
        pageHttpService.loadCategoryPath.mockReturnValue(
            of([{ id: 'home', name: 'Home' } as PageItem, { id: 'folder', name: 'Clients' } as PageItem])
        );
        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
        service.setViewMode(PageViewMode.Shared);
        flush();
        service.openCategory(FOLDER);
        flush();
        service.tableConfig()?.onRowDrop?.(FOLDER, [FILE]);
        const [context] = pageActionsService.moveItems.mock.calls[0];

        expect(service.tableConfig()?.isRowDraggable?.(FILE)).toBe(true);
        expect(context.getSharedRoot?.()).toEqual({ id: 'folder', label: 'Clients' });
    });

    it('offers no drag on the folders at the root of the shared tab', () => {
        pageHttpService.loadShared.mockReturnValue(of(buildResponse([FOLDER, { ...FOLDER, id: 'other' }])));
        service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
        service.setViewMode(PageViewMode.Shared);
        flush();

        expect(service.tableConfig()?.isRowDraggable).toBeUndefined();
    });
});
