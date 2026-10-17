import { BeyAvatarConfig } from '@beyonda-labs/angular-components';

import { Employee } from '../models/list-style-guide.model';

export function buildEmployee(id: number, [name, surname]: [string, string], role: string): Employee {
    return { avatar: new BeyAvatarConfig({ name, surname }), id, name: `${name} ${surname}`, role };
}
