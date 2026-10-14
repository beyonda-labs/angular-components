import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { withoutFolderActions } from './page-flat-view';
import { pageStandardAction } from './page-standard-actions';

describe('withoutFolderActions', () => {
    it('leaves out the actions on folders and the move, inside a group too, and keeps the rest', () => {
        const remove = pageStandardAction(PageStandardAction.Delete);
        const group = new PageAction({
            key: 'add-group',
            scope: PageActionScope.Group,
            subActions: [
                pageStandardAction(PageStandardAction.Create),
                pageStandardAction(PageStandardAction.CreateCategory)
            ],
            zone: PageActionZone.Right
        });

        const [first, ...rest] = withoutFolderActions([
            group,
            pageStandardAction(PageStandardAction.EditCategory),
            pageStandardAction(PageStandardAction.DeleteCategory),
            pageStandardAction(PageStandardAction.Move, { action: () => {} }),
            pageStandardAction(PageStandardAction.Share),
            remove
        ]);

        expect(rest).toEqual([remove]);
        expect([first.key, first.subActions?.map(action => action.key)]).toEqual([
            'add-group',
            [PageStandardAction.Create]
        ]);
    });
});
