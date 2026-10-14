import { PageAction, PageStandardAction } from '../models/page-action.model';

const FOLDER_ACTION_KEYS: ReadonlySet<string> = new Set<string>([
    PageStandardAction.CreateCategory,
    PageStandardAction.DeleteCategory,
    PageStandardAction.EditCategory,
    PageStandardAction.Move,
    PageStandardAction.Share
]);

export function withoutFolderActions(actions: PageAction[]): PageAction[] {
    return actions
        .filter(action => !FOLDER_ACTION_KEYS.has(action.key))
        .map(action =>
            action.subActions
                ? new PageAction({ ...action, subActions: withoutFolderActions(action.subActions) })
                : action
        );
}
