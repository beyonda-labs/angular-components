import { PageAction, PageStandardAction } from '../models/page-action.model';

export function withoutSharedRootMove(actions: PageAction[]): PageAction[] {
    return actions
        .filter(action => action.key !== PageStandardAction.Move)
        .map(action =>
            action.subActions
                ? new PageAction({ ...action, subActions: withoutSharedRootMove(action.subActions) })
                : action
        );
}
