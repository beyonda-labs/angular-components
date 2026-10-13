import { PageBackendResponse } from '../../../page/models/page.model';
import { PageStandardAction } from '../../../page/models/page-action.model';
import { withoutOrganizationFolders } from '../../functions/organization-folders';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { GroupRow, GroupsPageMode } from '../models/groups.model';

export function groupsPageMode(
    current: GroupsPageMode,
    { globalActions, results }: Pick<PageBackendResponse<GroupRow | OrganizationFolder>, 'globalActions' | 'results'>
): GroupsPageMode {
    const groups = withoutOrganizationFolders(results);

    if (
        (globalActions ?? []).includes(PageStandardAction.Create) ||
        groups.some(({ actions }) => actions.some(action => action !== PageStandardAction.View))
    ) {
        return GroupsPageMode.Manage;
    }

    if (groups.length === 0) {
        return current;
    }

    return groups.some(({ roleCount }) => roleCount !== undefined) ? GroupsPageMode.ReadWithRoles : GroupsPageMode.Read;
}
