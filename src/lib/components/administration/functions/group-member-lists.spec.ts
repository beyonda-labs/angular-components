import { FormListField } from '../../form/models/fields/form-list-field.model';
import { buildGroupMemberListRows } from './group-member-lists';

describe('group member lists', () => {
    function listsOf(rows: ReturnType<typeof buildGroupMemberListRows>): FormListField[] {
        return rows.flatMap(({ fields }) => fields) as FormListField[];
    }

    it('lists each group under its name, its members by name, surname and email', () => {
        const [sales, support] = listsOf(
            buildGroupMemberListRows(
                [
                    {
                        id: 'g1',
                        members: [
                            { email: 'ada@example.test', name: 'Ada', surname: 'Lovelace' },
                            { email: 'grace@example.test', name: null }
                        ],
                        name: 'Sales'
                    },
                    { id: 'g2', members: [], name: 'Support' }
                ],
                'demo.groups'
            )
        );

        expect([sales.key, sales.label, sales.items]).toEqual([
            'g1',
            'Sales',
            ['Ada Lovelace (ada@example.test)', 'grace@example.test']
        ]);
        expect([support.label, support.items, support.placeholder]).toEqual(['Support', [], 'demo.groups.no-members']);
    });

    it('says so, with no label, when there is no group', () => {
        const [empty] = listsOf(buildGroupMemberListRows([], 'demo.groups'));

        expect(empty).toMatchObject({ isLabelVisible: false, items: [], placeholder: 'demo.groups.empty' });
    });
});
