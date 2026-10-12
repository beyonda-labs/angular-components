import { PageBackendResponse } from '../../../page/models/page.model';
import { PageStandardAction } from '../../../page/models/page-action.model';
import { GroupRow, GroupsPageMode } from '../models/groups.model';

export function groupsPageMode(
    current: GroupsPageMode,
    { globalActions, results }: Pick<PageBackendResponse<GroupRow>, 'globalActions' | 'results'>
): GroupsPageMode {
    if (
        (globalActions ?? []).includes(PageStandardAction.Create) ||
        results.some(({ actions }) => actions.some(action => action !== PageStandardAction.View))
    ) {
        return GroupsPageMode.Manage;
    }

    if (results.length === 0) {
        return current;
    }

    return results.some(({ roleCount }) => roleCount !== undefined)
        ? GroupsPageMode.ReadWithRoles
        : GroupsPageMode.Read;
}
