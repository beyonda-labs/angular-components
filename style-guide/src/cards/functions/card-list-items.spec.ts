import { BeyAvatarVariant } from '@beyonda-labs/angular-components';

import { buildPerson, buildTeam } from './card-list-items';

describe('buildPerson', () => {
    it('shows a person by full name and a sample address, with a soft avatar of the name', () => {
        const person = buildPerson('u1', ['Ada', 'Lovelace']);

        expect([person.key, person.title, person.subtitle]).toEqual(['u1', 'Ada Lovelace', 'ada@example.test']);
        expect(person.avatar).toEqual(
            expect.objectContaining({ name: 'Ada', surname: 'Lovelace', variant: BeyAvatarVariant.Soft })
        );
    });
});

describe('buildTeam', () => {
    it('folds the members of a team and counts them in its subtitle', () => {
        const member = buildPerson('u2', ['Grace', 'Hopper']);
        const team = buildTeam('research', 'Research', [member]);

        expect([team.key, team.title, team.fold?.items]).toEqual(['research', 'Research', [member]]);
        expect(team.subtitle).toBe('angular-components-style-guide.cards.teams.members.one');
        expect(team.subtitleParameters).toEqual({ count: 1 });
    });

    it('counts an empty team with the plural text', () => {
        expect(buildTeam('platform', 'Platform', []).subtitle).toBe(
            'angular-components-style-guide.cards.teams.members.other'
        );
    });
});
