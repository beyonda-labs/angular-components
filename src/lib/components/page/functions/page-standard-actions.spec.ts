import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { HeaderActionType } from '../../header/models/header.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';
import { pageAddAction, pageStandardAction } from './page-standard-actions';

interface Template extends PageItem {
    name: string;
}

describe('page standard actions', () => {
    function placement<TItem extends PageItem>(
        action: PageAction<TItem>
    ): Pick<PageAction<TItem>, 'key' | 'scope' | 'type' | 'zone'> {
        return { key: action.key, scope: action.scope, type: action.type, zone: action.zone };
    }

    it('places every standard action where the page expects it', () => {
        expect(Object.values(PageStandardAction).map(key => placement(pageStandardAction(key)))).toEqual([
            {
                key: 'create',
                scope: PageActionScope.Global,
                type: HeaderActionType.PrimaryButton,
                zone: PageActionZone.Right
            },
            {
                key: 'create-category',
                scope: PageActionScope.Global,
                type: HeaderActionType.SecondaryButton,
                zone: PageActionZone.Right
            },
            { key: 'delete', scope: PageActionScope.Item, type: HeaderActionType.Text, zone: PageActionZone.Menu },
            {
                key: 'delete-category',
                scope: PageActionScope.Item,
                type: HeaderActionType.Text,
                zone: PageActionZone.Menu
            },
            {
                key: 'delete-trash-item',
                scope: PageActionScope.Item,
                type: HeaderActionType.Text,
                zone: PageActionZone.Menu
            },
            { key: 'edit', scope: PageActionScope.Single, type: HeaderActionType.Text, zone: PageActionZone.Left },
            {
                key: 'edit-category',
                scope: PageActionScope.Single,
                type: HeaderActionType.Text,
                zone: PageActionZone.Left
            },
            { key: 'move', scope: PageActionScope.Item, type: HeaderActionType.Text, zone: PageActionZone.Menu },
            {
                key: 'restore-trash-item',
                scope: PageActionScope.Item,
                type: HeaderActionType.Text,
                zone: PageActionZone.Left
            }
        ]);
        expect(pageStandardAction(PageStandardAction.Create).icon).toBe(faPlus);
    });

    it('keeps its key and takes whatever else the caller overrides, handler included', () => {
        const onDelete = jest.fn();
        const action = pageStandardAction<Template>(PageStandardAction.Delete, {
            handler: templates => onDelete(templates.map(template => template.name)),
            icon: faTrash,
            zone: PageActionZone.Right
        });

        action.handler?.([{ id: 1, name: 'Invoice' }]);

        expect(placement(action)).toEqual({
            key: 'delete',
            scope: PageActionScope.Item,
            type: HeaderActionType.SecondaryButton,
            zone: PageActionZone.Right
        });
        expect(action.icon).toBe(faTrash);
        expect(onDelete).toHaveBeenCalledWith(['Invoice']);
    });

    it('groups create and create-category as text entries under a primary add button', () => {
        const group = pageAddAction();

        expect(placement(group)).toEqual({
            key: 'add-group',
            scope: PageActionScope.Group,
            type: HeaderActionType.PrimaryButton,
            zone: PageActionZone.Right
        });
        expect(group.icon).toBe(faPlus);
        expect(group.subActions?.map(action => ({ icon: action.icon, ...placement(action) }))).toEqual([
            {
                icon: undefined,
                key: 'create',
                scope: PageActionScope.Global,
                type: HeaderActionType.Text,
                zone: PageActionZone.Right
            },
            {
                icon: undefined,
                key: 'create-category',
                scope: PageActionScope.Global,
                type: HeaderActionType.Text,
                zone: PageActionZone.Right
            }
        ]);
    });

    it('takes other entries for the add group', () => {
        const importAction = new PageAction({
            key: 'import',
            scope: PageActionScope.Global,
            type: HeaderActionType.Text,
            zone: PageActionZone.Right
        });

        expect(pageAddAction({ subActions: [importAction] }).subActions).toEqual([importAction]);
    });
});
