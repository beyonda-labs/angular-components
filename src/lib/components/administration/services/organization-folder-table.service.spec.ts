import { TestBed } from '@angular/core/testing';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PageItemType } from '../../page/models/page-categories.model';
import { LinkTableCell } from '../../table/models/table-cell.model';
import { OrganizationFolder } from '../models/organization-folders.model';
import { OrganizationFolderTableService } from './organization-folder-table.service';

describe('OrganizationFolderTableService', () => {
    let service: OrganizationFolderTableService;

    function buildFolder(overrides: Partial<OrganizationFolder> = {}): OrganizationFolder {
        return { actions: [], entryType: PageItemType.Category, id: 'o1', name: 'Acme', ...overrides };
    }

    function nameCell(folder: OrganizationFolder, onOpen = jest.fn()): LinkTableCell {
        return service.loadRow(folder, { onOpen })[0] as LinkTableCell;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(OrganizationFolderTableService);
    });

    it('names the folder after its organization, with a folder icon, and opens it', () => {
        const onOpen = jest.fn();
        const folder = buildFolder();
        const cell = nameCell(folder, onOpen);

        cell.action();

        expect(cell).toMatchObject({ content: 'Acme', icon: faFolder, translate: false });
        expect(onOpen).toHaveBeenCalledWith(folder);
    });

    it('gives the folder no tooltip, as the folders of the other pages, since its breadcrumb counts its rows', () => {
        expect(nameCell(buildFolder({ itemCount: 12 })).tooltip).toBeUndefined();
    });
});
