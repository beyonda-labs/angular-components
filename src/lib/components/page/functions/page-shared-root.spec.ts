import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { withoutSharedRootMove } from './page-shared-root';
import { pageStandardAction } from './page-standard-actions';

describe('withoutSharedRootMove', () => {
    it('leaves out the move, with or without an action of its own and inside a group too, and keeps the rest', () => {
        const share = pageStandardAction(PageStandardAction.Share);
        const group = new PageAction({
            key: 'more',
            scope: PageActionScope.Group,
            subActions: [pageStandardAction(PageStandardAction.Move), share],
            zone: PageActionZone.Menu
        });
        const customMove = pageStandardAction(PageStandardAction.Move, { action: () => {} });

        const [first, ...rest] = withoutSharedRootMove([customMove, group, share]);

        expect(rest).toEqual([share]);
        expect([first.key, first.subActions]).toEqual(['more', [share]]);
    });
});
