import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormRow } from '../../form/models/form.model';
import { GroupMemberList } from '../models/group-member-lists.model';
import { userContactLabel } from './user-names';

export function buildGroupMemberListRows(groups: GroupMemberList[], groupsPrefix: string): FormRow[] {
    if (groups.length === 0) {
        return [
            new FormRow({
                fields: [
                    new FormListField({ isLabelVisible: false, key: 'empty', placeholder: `${groupsPrefix}.empty` })
                ]
            })
        ];
    }

    return groups.map(
        ({ id, members, name }) =>
            new FormRow({
                fields: [
                    new FormListField({
                        items: members.map(member => userContactLabel(member)),
                        key: id,
                        label: name,
                        placeholder: `${groupsPrefix}.no-members`
                    })
                ]
            })
    );
}
