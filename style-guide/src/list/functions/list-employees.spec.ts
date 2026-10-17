import { BeyAvatarConfig } from '@beyonda-labs/angular-components';

import { buildEmployee } from './list-employees';

describe('buildEmployee', () => {
    it('names an employee in full, with an avatar of the name and the role given', () => {
        expect(buildEmployee(1, ['Ada', 'Lovelace'], 'Engineering')).toEqual({
            avatar: new BeyAvatarConfig({ name: 'Ada', surname: 'Lovelace' }),
            id: 1,
            name: 'Ada Lovelace',
            role: 'Engineering'
        });
    });
});
