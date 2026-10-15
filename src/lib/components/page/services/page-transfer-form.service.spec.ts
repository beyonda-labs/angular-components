import { TestBed } from '@angular/core/testing';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { PageTransferFormOptions, PageTransferFormValue, PageTransferTargets } from '../models/page-transfer.model';
import { PageTransferFormService } from './page-transfer-form.service';

const ADA = { id: 'u1', name: 'Ada Lovelace' };
const GRACE = { id: 'u2', name: 'Grace Hopper' };
const TARGETS: PageTransferTargets = {
    hasMore: true,
    options: [
        { description: 'grace@test.com', label: 'Grace Hopper', value: 'u2' },
        { description: 'alan@test.com', label: 'alan@test.com', value: 'u3' },
        { label: 'Linus Torvalds', value: 'u4' }
    ]
};
const TRANSLATIONS = {
    'angular-components': {
        page: {
            transfer: {
                notice: 'The chosen person becomes the owner of the selected items.',
                'several-owners': 'Several owners',
                title: { one: 'Change the owner of the selected item', other: 'Change the owner of {{count}} items' }
            }
        },
        'user-name': { unknown: 'Unknown' }
    },
    products: { transfer: { notice: 'Templates come with their blocks.' } }
};

describe('PageTransferFormService', () => {
    const searchTargets = jest.fn<Observable<PageTransferTargets>, [string, number]>();
    let service: PageTransferFormService;

    function build(overrides: Partial<PageTransferFormOptions> = {}): ModalFormConfig<PageTransferFormValue> {
        return service.buildTransferForm({
            count: 1,
            notice: 'angular-components.page.transfer.notice',
            owners: [ADA],
            searchTargets,
            ...overrides
        });
    }

    function info(form: ModalFormConfig<PageTransferFormValue>, key: string): string[] | undefined {
        const field = fieldsOf<FormInfoField>(form).find(candidate => candidate.key === key);

        return field?.items.map(({ label }) => label);
    }

    function picker(form: ModalFormConfig<PageTransferFormValue>): FormAutocompleteField {
        return fieldsOf(form).find(field => field.key === 'targetUserId') as FormAutocompleteField;
    }

    beforeEach(() => {
        searchTargets.mockReset();
        searchTargets.mockReturnValue(of(TARGETS));
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ translations: { en: TRANSLATIONS } })] });

        service = TestBed.inject(PageTransferFormService);
    });

    it('titles the form after how many rows change owner', () => {
        expect(build().title).toBe('Change the owner of the selected item');
        expect(build({ count: 3 }).title).toBe('Change the owner of 3 items');
    });

    it('explains what the new owner gets, with the text the page gives', () => {
        expect(info(build(), 'notice')).toEqual(['The chosen person becomes the owner of the selected items.']);
        expect(info(build({ notice: 'products.transfer.notice' }), 'notice')).toEqual([
            'Templates come with their blocks.'
        ]);
    });

    it('names the current owner, an owner the server no longer resolves as unknown, or several owners', () => {
        expect(info(build(), 'owner')).toEqual(['Ada Lovelace']);
        expect(info(build({ owners: [{ id: 'u9', name: null }] }), 'owner')).toEqual(['Unknown']);
        expect(info(build({ owners: [ADA, GRACE] }), 'owner')).toEqual(['Several owners']);
        expect(info(build({ owners: [] }), 'owner')).toBeUndefined();
    });

    it('asks for one new owner with a typeahead, required and empty at first', () => {
        const form = build();

        expect(picker(form).isRequired).toBe(true);
        expect(picker(form).isTypeahead).toBe(true);
        expect(picker(form).emptyKey).toBe('angular-components.page.transfer.no-targets');
        expect(form.initialValue).toEqual({ main: { targetUserId: '' } });
        expect(form.submitLabel).toBe('angular-components.page.transfer.submit');
    });

    it('searches the typed text with a limit of 20, naming each user with their email, and passes on the hint of more', async () => {
        const result = await firstValueFrom(
            picker(build()).search?.('a', []) as Observable<FormAutocompleteSearchResult>
        );

        expect(searchTargets).toHaveBeenCalledWith('a', 20);
        expect(result).toEqual({
            hasMore: true,
            options: [
                { label: 'Grace Hopper (grace@test.com)', value: 'u2' },
                { label: 'alan@test.com', value: 'u3' },
                { label: 'Linus Torvalds', value: 'u4' }
            ]
        });
    });

    it('says there are no more matches when the answer does not say otherwise', async () => {
        searchTargets.mockReturnValue(of({ options: [] }));

        const result = await firstValueFrom(
            picker(build()).search?.('zz', []) as Observable<FormAutocompleteSearchResult>
        );

        expect(result).toEqual({ hasMore: false, options: [] });
    });
});
