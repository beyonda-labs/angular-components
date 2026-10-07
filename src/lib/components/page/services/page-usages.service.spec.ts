import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import { PageConfig } from '../models/page.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageUsagesConfig, PageUser } from '../models/page-usages.model';
import { PageHttpService } from './page-http.service';
import { PageUsagesService } from './page-usages.service';

const OFFER: PageUser = { id: 't-1', kind: 'template', name: 'Offer', resource: 'templates' };
const HEADER: PageUser = { id: 't-2', kind: 'content-block', name: 'Header', resource: 'templates' };
const CONFIRMATION = { message: 'files.modal.delete.message', messageParameters: { count: 1 }, title: 'Delete' };
const USAGES_CONFIG = new PageUsagesConfig({ suffixes: { 'content-block': 'files.usages.block' } });

describe('PageUsagesService', () => {
    let service: PageUsagesService;

    const findUsages = jest.fn();

    function buildConfig(overrides: Partial<PageConfig> = {}): PageConfig {
        return new PageConfig({ baseUrl: '/files', prefix: 'files', usagesConfig: USAGES_CONFIG, ...overrides });
    }

    beforeEach(() => {
        findUsages.mockReset();

        TestBed.configureTestingModule({
            providers: [provideBeyTesting(), { provide: PageHttpService, useValue: { findUsages } }]
        });

        service = TestBed.inject(PageUsagesService);
    });

    describe('confirmInUse', () => {
        it('asks for the usages of the items and warns with the in-use texts of the action', () => {
            findUsages.mockReturnValue(of([{ id: 'a', total: 2, users: [OFFER, HEADER] }]));
            let shown: unknown;

            service.confirmInUse(buildConfig(), 'delete', [{ id: 'a' }], CONFIRMATION).subscribe(config => {
                shown = config;
            });

            expect(findUsages).toHaveBeenCalledWith('/files', ['a']);
            expect(shown).toEqual({
                message: 'files.modal.delete-in-use.message',
                messageParameters: { count: 1, usageCount: 2, users: 'Offer, Header (files.usages.block)' },
                title: 'files.modal.delete-in-use.title'
            });
        });

        it('asks only for the items of the selection, not its folders', () => {
            findUsages.mockReturnValue(of([]));
            const tableConfig = new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                loadRow: () => []
            });

            service
                .confirmInUse(
                    buildConfig({ tableConfig }),
                    'delete-trash-item',
                    [
                        { id: 'folder', type: PageItemType.Category } as never,
                        { id: 'a', type: PageItemType.Item } as never
                    ],
                    CONFIRMATION
                )
                .subscribe();

            expect(findUsages).toHaveBeenCalledWith('/files', ['a']);
        });

        it('keeps the confirmation of any other action without asking', () => {
            let shown: unknown;

            service.confirmInUse(buildConfig(), 'delete-category', [{ id: 'a' }], CONFIRMATION).subscribe(config => {
                shown = config;
            });

            expect(shown).toBe(CONFIRMATION);
            expect(findUsages).not.toHaveBeenCalled();
        });

        it('keeps the confirmation without asking when the page has no usages, or only folders are selected', () => {
            const answers: unknown[] = [];

            service
                .confirmInUse(buildConfig({ usagesConfig: undefined }), 'delete', [{ id: 'a' }], CONFIRMATION)
                .subscribe(config => answers.push(config));
            service.confirmInUse(buildConfig(), 'delete', [], CONFIRMATION).subscribe(config => answers.push(config));

            expect(answers).toEqual([CONFIRMATION, CONFIRMATION]);
            expect(findUsages).not.toHaveBeenCalled();
        });
    });

    describe('listUsers', () => {
        it('names the users the row carries when they are all of them', () => {
            const users = service.listUsers(
                '/files',
                { id: 'a', usageCount: 1, usedBy: [HEADER] } as never,
                USAGES_CONFIG
            );

            expect(users()).toEqual(['Header (files.usages.block)']);
            expect(findUsages).not.toHaveBeenCalled();
        });

        it('asks for every user when the row lists only the first ones', () => {
            findUsages.mockReturnValue(of([{ id: 'a', total: 2, users: [OFFER, HEADER] }]));

            const users = service.listUsers(
                '/files',
                { id: 'a', usageCount: 2, usedBy: [OFFER] } as never,
                USAGES_CONFIG
            );

            expect(findUsages).toHaveBeenCalledWith('/files', ['a']);
            expect(users()).toEqual(['Offer', 'Header (files.usages.block)']);
        });

        it('keeps the first users when the answer names none', () => {
            findUsages.mockReturnValue(of([]));

            const users = service.listUsers(
                '/files',
                { id: 'a', usageCount: 2, usedBy: [OFFER] } as never,
                USAGES_CONFIG
            );

            expect(users()).toEqual(['Offer', '...']);
        });
    });

    it('answers no usages without asking for no id', () => {
        let answer: unknown;

        service.find('/files', []).subscribe(usages => {
            answer = usages;
        });

        expect(answer).toEqual([]);
        expect(findUsages).not.toHaveBeenCalled();
    });
});
