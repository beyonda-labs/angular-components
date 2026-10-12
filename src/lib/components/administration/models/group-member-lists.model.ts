import { NamedUser } from './user-names.model';

export interface GroupMemberList {
    id: string;
    members: NamedUser[];
    name: string;
}
