import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormSection } from '../../form/models/form.model';
import { buildShareChoices } from '../functions/page-shares';
import { PageInheritedShare, PageShareAccess, PageShareGranteeType } from '../models/page-sharing.model';
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
const TARGETS = {
    groups: [{ id: 'g1', name: 'Sales' }],
    users: [
        { email: 'grace@test.com', id: 'u2', name: 'Grace Hopper' },
        { email: 'linus@test.com', id: 'u3', name: 'Linus Torvalds' }
    ]
};
const TRANSLATIONS = {
    'angular-components': {
        page: {
            share: {
                access: { inherited: '{{access}} (from {{folder}})', read: 'View', write: 'Edit' },
                inherited: {
                    group: '{{name}} (group): {{access}}, from {{folder}}',
                    user: '{{name}}: {{access}}, from {{folder}}'
                },
                title: 'Share "{{name}}"'
            }
        }
    }
};

describe('PageShareFormService', () => {
    let service: PageShareFormService;

    function selects(section: FormSection): FormSelectField[] {
        return section.rows.flatMap(row => row.fields) as FormSelectField[];
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ translations: { en: TRANSLATIONS } })] });

        service = TestBed.inject(PageShareFormService);
    });

    it('titles the form with the folder and lists the inherited access before the groups and the users', () => {
        const inherited = [HOME_SALES, HOME_GRACE];
        const form = service.buildShareForm(
            'Clients',
            buildShareChoices({ inherited, shares: [] }, TARGETS),
            inherited
        );
        const [inheritedSection] = form.sections;

        expect(form.title).toBe('Share "Clients"');
        expect(form.sections.map(section => section.key)).toEqual(['inherited', 'groups', 'users']);
        expect((inheritedSection.rows[0].fields[0] as FormListField).items).toEqual([
            'Sales (group): View, from Home',
            'Grace Hopper: Edit, from Home'
        ]);
    });

    it('offers a select per target, named after it, with its email as hint and no access as the empty choice', () => {
        const form = service.buildShareForm('Clients', buildShareChoices({ inherited: [], shares: [] }, TARGETS), []);
        const [linus] = selects(form.sections[1]).slice(1);

        expect(selects(form.sections[1]).map(field => field.label)).toEqual(['Grace Hopper', 'Linus Torvalds']);
        expect(linus.hint).toBe('linus@test.com');
        expect(linus.placeholder).toBe('angular-components.page.share.access.none');
        expect(linus.options).toEqual([
            { label: 'angular-components.page.share.access.read', value: 'read' },
            { label: 'angular-components.page.share.access.write', value: 'write' }
        ]);
        expect(form.initialValue).toEqual({ groups: { 'group-0': '' }, users: { 'user-0': '', 'user-1': '' } });
    });

    it('names the inherited access as the empty choice, offers only what is above it, and locks an inherited edit', () => {
        const inherited = [HOME_SALES, HOME_GRACE];
        const form = service.buildShareForm(
            'Clients',
            buildShareChoices({ inherited, shares: [] }, TARGETS),
            inherited
        );
        const [sales] = selects(form.sections[1]);
        const [grace] = selects(form.sections[2]);

        expect(sales.placeholder).toBe('View (from Home)');
        expect(sales.options).toEqual([{ label: 'angular-components.page.share.access.write', value: 'write' }]);
        expect(sales.isDisabled).toBe(false);
        expect(grace.placeholder).toBe('Edit (from Home)');
        expect(grace.options).toEqual([]);
        expect(grace.isDisabled).toBe(true);
    });

    it('says there is nobody to share with when the organization has no other user nor group', () => {
        const form = service.buildShareForm('Clients', [], []);
        const [empty] = form.sections[0].rows[0].fields as FormListField[];

        expect(form.sections.map(section => section.key)).toEqual(['targets']);
        expect(empty.placeholder).toBe('angular-components.page.share.empty');
    });
});
