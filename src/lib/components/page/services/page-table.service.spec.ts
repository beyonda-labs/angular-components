import { TestBed } from '@angular/core/testing';
import { faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SHARED_FOLDER_ICON } from '../../../utilities/icons.model';
import { LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { PageConfig } from '../models/page.model';
import {
    PageCategoriesConfig,
    PageCategoriesConfigParameters,
    PageItemType,
    PageViewMode
} from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageTableService } from './page-table.service';

const CLIENTS = { id: 'clients', name: 'Clients', type: PageItemType.Category } as PageItem;
const OFFER = { id: 'offer', name: 'Offer', parentPath: ['Clients'], type: PageItemType.Item } as PageItem;

describe('PageTableService', () => {
    let service: PageTableService;

    function buildConfig(
        loadCategoryRow?: (category: PageItem, viewMode: PageViewMode) => TableCell[],
        categoriesConfig: Partial<PageCategoriesConfigParameters> = {}
    ): PageConfig {
        return new PageConfig({
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({ loadRow: loadCategoryRow, ...categoriesConfig }),
                columns: [],
                loadRow: (item, viewMode) => [new TextTableCell({ content: `${String(item.id)} ${viewMode}` })]
            })
        });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(PageTableService);
    });

    it('draws an item with the loadRow of the table and the view it is shown in', () => {
        const [cell] = service.loadRow(buildConfig(), OFFER, PageViewMode.Shared, jest.fn());

        expect(cell.content).toBe('offer shared');
    });

    it('draws a folder as a link that opens it, and as plain text in the trash', () => {
        const onOpenCategory = jest.fn();
        const [link] = service.loadRow(buildConfig(), CLIENTS, PageViewMode.Table, onOpenCategory) as LinkTableCell[];
        const [trashed] = service.loadRow(buildConfig(), CLIENTS, PageViewMode.Trash, onOpenCategory);

        link.action();

        expect(onOpenCategory).toHaveBeenCalledWith(CLIENTS);
        expect(trashed).toBeInstanceOf(TextTableCell);
        expect(trashed.content).toBe('Clients');
    });

    it('draws a folder with the loadRow of the categories when there is one', () => {
        const loadCategoryRow = jest.fn(() => [new TextTableCell({ content: 'Folder' })]);

        service.loadRow(buildConfig(loadCategoryRow), CLIENTS, PageViewMode.Shared, jest.fn());

        expect(loadCategoryRow).toHaveBeenCalledWith(CLIENTS, PageViewMode.Shared);
    });

    describe('shared folders', () => {
        const SHARED_CLIENTS = { ...CLIENTS, isShared: true } as PageItem;
        const folderCell = (): TableCell[] => [
            new LinkTableCell({ action: jest.fn(), content: 'Clients', icon: faFolder }),
            new TextTableCell({ content: 'Ada' })
        ];

        it('marks the first cell of a shared folder, or of any folder of the shared view, with the shared icon', () => {
            const config = buildConfig(folderCell);
            const [shared, owner] = service.loadRow(config, SHARED_CLIENTS, PageViewMode.Table, jest.fn());
            const [inSharedView] = service.loadRow(config, CLIENTS, PageViewMode.Shared, jest.fn());
            const [plain] = service.loadRow(config, CLIENTS, PageViewMode.Table, jest.fn()) as LinkTableCell[];

            expect(shared).toEqual(
                expect.objectContaining({
                    content: 'Clients',
                    icon: SHARED_FOLDER_ICON,
                    iconLabel: 'angular-components.page.shared.folder'
                })
            );
            expect(shared).toBeInstanceOf(LinkTableCell);
            expect(owner.content).toBe('Ada');
            expect(inSharedView).toEqual(expect.objectContaining({ icon: SHARED_FOLDER_ICON }));
            expect(plain.icon).toBe(faFolder);
            expect(plain.iconLabel).toBeUndefined();
        });

        it('marks a shared folder drawn by the page itself, and takes the icon the categories config names', () => {
            const [drawn] = service.loadRow(buildConfig(), SHARED_CLIENTS, PageViewMode.Table, jest.fn());
            const [custom] = service.loadRow(
                buildConfig(folderCell, { sharedIcon: { icon: faFolderOpen, label: 'demo.shared' } }),
                SHARED_CLIENTS,
                PageViewMode.Table,
                jest.fn()
            );

            expect(drawn).toEqual(expect.objectContaining({ content: 'Clients', icon: SHARED_FOLDER_ICON }));
            expect(custom).toEqual(expect.objectContaining({ icon: faFolderOpen, iconLabel: 'demo.shared' }));
        });
    });

    it('tells in the trash where a restore puts a row back, ending with the row itself', () => {
        const [cell] = service.loadRow(buildConfig(), OFFER, PageViewMode.Trash, jest.fn());

        expect(cell.tooltip).toBe('demo.categories.root / Clients / Offer');
    });

    it('ends the trash origin of a folder with the folder itself', () => {
        const trashedFolder = { ...CLIENTS, parentPath: [] } as PageItem;
        const [cell] = service.loadRow(buildConfig(), trashedFolder, PageViewMode.Trash, jest.fn());

        expect(cell.tooltip).toBe('demo.categories.root / Clients');
    });
});
