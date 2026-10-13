import { userNameOrUnknown } from '../../../../internal/user-name/user-name';
import { contentLabel } from '../../functions/content-counts';
import { ContentTranslate } from '../../models/content-counts.model';
import { UserContent, UserContentFormOptions, USERS_LIST_SEPARATOR } from '../models/users.model';

export function usedByOthersLines(
    contents: UserContent[],
    { contentLabels, prefix }: UserContentFormOptions,
    translate: ContentTranslate
): string[] {
    return contents.flatMap(({ usedByOthers }) =>
        Object.entries(usedByOthers).flatMap(([key, usages]) =>
            usages.map(({ id, name, users }) =>
                translate(`${prefix}.content.used-by`, {
                    entity: contentLabel(key, contentLabels, translate),
                    name: name ?? id,
                    users: users
                        .map(user => `${user.name ?? user.id} (${userNameOrUnknown(user.ownerName, translate)})`)
                        .join(USERS_LIST_SEPARATOR)
                })
            )
        )
    );
}
