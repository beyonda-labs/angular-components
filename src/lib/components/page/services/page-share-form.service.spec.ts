import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormAutocompleteSearchResult } from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormSection } from '../../form/models/form.model';
import { FormValue } from '../../form/models/form-field.model';
import {
    PageInheritedShare,
    PageShare,
    PageShareAccess,
    PageShareFormOptions,
    PageShareFormValue,
    PageShareGranteeType,
    PageShareTargets
} from '../models/page-sharing.model';
import { PageShareFormService } from './page-share-form.service';

const HOME_SALES: PageInheritedShare = {
    access: PageShareAccess.Read,
    folderId: 'home',
    folderName: 'Home',
    granteeId: 'g1',
    granteeName: 'Sales',
    granteeType: PageShareGranteeType.Group,
    id: 's1'
};
const HOME_GRACE: PageInheritedShare = {
    ...HOME_SALES,
    access: PageShareAccess.Write,
    granteeId: 'u2',
    granteeName: 'Grace Hopper',
    granteeType: PageShareGranteeType.User,
    id: 's2'
};
const OPS_VIEWS: PageShare = {
    access: PageShareAccess.Read,
    granteeId: 'g2',
    granteeName: 'Ops',
    granteeType: PageShareGranteeType.Group,
    id: 's3'
};
const LINUS_EDITS: PageShare = {
    access: PageShareAccess.Write,
    granteeId: 'u3',
    granteeName: 'Linus Torvalds',
    granteeType: PageShareGranteeType.User,
    id: 's4'
};
const TARGETS: PageShareTargets = {
    groups: [
        { id: 'g1', memberCount: 3, name: 'Sales' },
        { id: 'g2', memberCount: 1, name: 'Ops' }
    ],
    hasMore: false,
    users: [
        { email: 'grace@test.com', id: 'u2', name: 'Grace Hopper' },
        { email: 'linus@test.com', id: 'u3', name: 'Linus Torvalds' }
    ]
};
const TRANSLATIONS = {
    'angular-components': {
        page: {
            share: {
                access: { read: 'View', write: 'Edit' },
                grantee: {
                    group: '{{name}} (group)',
                    members: { one: '{{name}} ({{count}} member)', other: '{{name}} ({{count}} members)' }
                },
                inherited: {
                    group: '{{name}} (group): {{access}}, from {{folder}}',
                    user: '{{name}}: {{access}}, from {{folder}}'
                },
                intro: 'Sharing decides where people can work.',
                title: 'Share "{{name}}"'
            }
        }
    }
};

describe('PageShareFormService', () => {
    const searchTargets = jest.fn<Observable<PageShareTargets>, [string, number]>();
    let service: PageShareFormService;

    function build(overrides: Partial<PageShareFormOptions> = {}): ModalFormConfig<PageShareFormValue> {
        return service.buildShareForm({
            folderName: 'Clients',
            inherited: [],
            searchTargets,
            shares: [],
            ...overrides
        });
    }

    function excludedBy(list: FormListField, value: PageShareFormValue): string[] {
        return (list.excludedValues as (value: FormValue) => string[])(value as FormValue);
    }

    function list(form: ModalFormConfig<PageShareFormValue>, access: PageShareAccess): FormListField {
        const fields = sectionOf(form, 'grantees')?.rows.flatMap(row => row.fields) ?? [];

        return fields.find(field => field.key === access) as FormListField;
    }

    function search(
        listField: FormListField,
        text: string,
        excluded: string[] = []
    ): Promise<FormAutocompleteSearchResult> {
        return firstValueFrom(listField.picker?.search?.(text, excluded) as Observable<FormAutocompleteSearchResult>);
    }

    function sectionOf(form: ModalFormConfig<PageShareFormValue>, key: string): FormSection | undefined {
        return form.sections.find(section => section.key === key);
    }

    beforeEach(() => {
        searchTargets.mockReset();
        searchTargets.mockReturnValue(of(TARGETS));
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ translations: { en: TRANSLATIONS } })] });

        service = TestBed.inject(PageShareFormService);
    });

    it('titles the form with the folder and lists the inherited access under a view list and an edit list', () => {
        const form = build({ inherited: [HOME_SALES, HOME_GRACE] });
        const inheritedSection = sectionOf(form, 'inherited');

        expect(form.title).toBe('Share "Clients"');
        expect(form.sections.map(section => section.key)).toEqual(['intro', 'grantees', 'inherited']);
        expect(sectionOf(form, 'grantees')?.rows.map(row => row.fields.map(field => field.key))).toEqual([
            ['read'],
            ['write']
        ]);
        expect((inheritedSection?.rows[0].fields[0] as FormListField).items).toEqual([
            'Sales (group): View, from Home',
            'Grace Hopper: Edit, from Home'
        ]);
    });

    it('leaves the inherited list out when nothing above the folder reaches it', () => {
        expect(build().sections.map(section => section.key)).toEqual(['intro', 'grantees']);
    });

    it('opens with a line saying that sharing decides where people work, not what they may do there', () => {
        const [intro] = (sectionOf(build(), 'intro')?.rows[0].fields ?? []) as FormInfoField[];

        expect(intro.isLabelVisible).toBe(false);
        expect(intro.items.map(({ label }) => label)).toEqual(['Sharing decides where people can work.']);
    });

    it('fills each list with the own shares of its access, removable, a group named as one', () => {
        const form = build({ shares: [OPS_VIEWS, LINUS_EDITS] });
        const view = list(form, PageShareAccess.Read);
        const edit = list(form, PageShareAccess.Write);

        expect(form.initialValue).toEqual({ grantees: { read: ['group:g2'], write: ['user:u3'] } });
        expect(view.options).toEqual([{ label: 'Ops (group)', value: 'group:g2' }]);
        expect(edit.options).toEqual([{ label: 'Linus Torvalds', value: 'user:u3' }]);
        expect(view.isRemovable && edit.isRemovable).toBe(true);
        expect(view.emptyKey).toBe('angular-components.page.share.grantees.read.empty');
        expect(view.picker?.emptyKey).toBe('angular-components.page.share.grantees.no-match');
    });

    it('searches users and groups together, a group named with its members and a user with their email', async () => {
        const result = await search(list(build(), PageShareAccess.Read), 'o');

        expect(searchTargets).toHaveBeenCalledWith('o', 20);
        expect(result).toEqual({
            hasMore: false,
            options: [
                { label: 'Sales (3 members)', value: 'group:g1' },
                { label: 'Ops (1 member)', value: 'group:g2' },
                { label: 'Grace Hopper (grace@test.com)', value: 'user:u2' },
                { label: 'Linus Torvalds (linus@test.com)', value: 'user:u3' }
            ]
        });
    });

    it('asks for one more target per grantee it leaves out, never above 50, and passes on the hint of more', async () => {
        searchTargets.mockReturnValue(of({ ...TARGETS, hasMore: true }));
        const view = list(build(), PageShareAccess.Read);

        const result = await search(view, 'o', ['group:g1', 'user:u3']);
        await search(
            view,
            '',
            Array.from({ length: 40 }, (_, index) => `user:x${index}`)
        );

        expect(searchTargets.mock.calls).toEqual([
            ['o', 22],
            ['', 50]
        ]);
        expect(result.hasMore).toBe(true);
        expect(result.options.map(({ value }) => value)).toEqual(['group:g2', 'user:u2']);
    });

    it('shows 20 suggestions at most, saying there are more', async () => {
        const users = Array.from({ length: 22 }, (_, index) => ({ id: `u${index}`, name: `User ${index}` }));
        searchTargets.mockReturnValue(of({ groups: [], users }));

        const result = await search(list(build(), PageShareAccess.Write), 'user', ['user:u0']);

        expect(result.options).toHaveLength(20);
        expect(result.options[0].label).toBe('User 1');
        expect(result.hasMore).toBe(true);
    });

    it('never offers in one list who the other one holds, nor whom an inherited share already covers', () => {
        const form = build({ inherited: [HOME_SALES, HOME_GRACE] });
        const value = { grantees: { read: ['user:u3'], write: ['group:g2'] } };

        expect(excludedBy(list(form, PageShareAccess.Read), value)).toEqual(['group:g2', 'group:g1', 'user:u2']);
        expect(excludedBy(list(form, PageShareAccess.Write), value)).toEqual(['user:u3', 'user:u2']);
    });

    it('needs a change in the lists before it can be saved', () => {
        expect(build({ shares: [OPS_VIEWS] }).allowSubmitWithoutChanges).toBe(false);
    });
});
