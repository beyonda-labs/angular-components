import { UNKNOWN_USER_NAME_KEY } from './models/user-name.model';

export function userNameOrUnknown(name: string | null | undefined, translate: (key: string) => string): string {
    return name?.trim() ? name : translate(UNKNOWN_USER_NAME_KEY);
}
