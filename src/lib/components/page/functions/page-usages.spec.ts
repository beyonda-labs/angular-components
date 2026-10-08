import { PageUser } from '../models/page-usages.model';
import { buildInUseConfirmation, describeUsers, readRowUsers } from './page-usages';

const OFFER: PageUser = { id: 't-1', kind: 'template', name: 'Offer', resource: 'templates' };
const HEADER: PageUser = { id: 't-2', kind: 'content-block', name: 'Header', resource: 'templates' };
const LOGO: PageUser = { id: 'v-1', name: 'logo', resource: 'global-variables' };
const SUFFIXES = { 'content-block': 'block', 'global-variables': 'global variable' };
const CONFIRMATION = { message: 'files.modal.delete.message', messageParameters: { count: 2 }, title: 'Delete' };

describe('buildInUseConfirmation', () => {
    const options = {
        confirmation: CONFIRMATION,
        inUseModal: 'files.modal.delete-in-use',
        listedUsers: 10,
        selectedIds: ['a', 'b'],
        suffixes: SUFFIXES
    };

    it('keeps the confirmation when nothing uses the rows', () => {
        expect(buildInUseConfirmation({ ...options, usages: [{ id: 'a', total: 0, users: [] }] })).toBe(CONFIRMATION);
    });

    it('names every user once, with the suffix of its kind or its resource', () => {
        const confirmation = buildInUseConfirmation({
            ...options,
            usages: [
                { id: 'a', total: 2, users: [OFFER, HEADER] },
                { id: 'b', total: 2, users: [OFFER, LOGO] }
            ]
        });

        expect(confirmation).toEqual({
            message: 'files.modal.delete-in-use.message',
            messageParameters: { count: 2, usageCount: 3, users: 'Offer, Header (block), logo (global variable)' },
            title: 'files.modal.delete-in-use.title'
        });
    });

    it('leaves out a user that is itself being deleted', () => {
        const confirmation = buildInUseConfirmation({
            ...options,
            selectedIds: ['a', 't-2'],
            usages: [{ id: 'a', total: 1, users: [HEADER] }]
        });

        expect(confirmation).toBe(CONFIRMATION);
    });

    it('lists the first users and counts those the answer left out', () => {
        const confirmation = buildInUseConfirmation({
            ...options,
            listedUsers: 1,
            usages: [{ id: 'a', total: 5, users: [OFFER, HEADER] }]
        });

        expect(confirmation.messageParameters).toEqual({ count: 2, usageCount: 5, users: 'Offer, ...' });
    });
});

describe('describeUsers', () => {
    it('ends with an ellipsis when the users are fewer than the total', () => {
        expect(describeUsers([OFFER], 3, SUFFIXES)).toEqual(['Offer', '...']);
    });

    it('names the users as they are without a suffix for them', () => {
        expect(describeUsers([OFFER, LOGO], 2, {})).toEqual(['Offer', 'logo']);
    });
});

describe('readRowUsers', () => {
    it('reads the count and the users of a row', () => {
        expect(readRowUsers({ id: 'a', usageCount: 4, usedBy: [OFFER] } as never)).toEqual({
            total: 4,
            users: [OFFER]
        });
    });

    it('answers no users for a row without them', () => {
        expect(readRowUsers({ id: 'a' })).toEqual({ total: 0, users: [] });
    });
});
