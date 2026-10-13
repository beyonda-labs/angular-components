import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { OrganizationSummary } from '../models/organization-summary.model';
import { OrganizationSummaryCardsService } from './organization-summary-cards.service';

const ADA = { email: 'ada@example.test', id: 'u1', name: 'Ada', surname: null };
const PREFIX = 'demo.summary';
const SUMMARY: OrganizationSummary = {
    administrators: [],
    counts: { extraRoles: 2, groups: 1, members: 3 },
    createdAt: Date.UTC(2026, 9, 12, 12),
    extraRoles: [
        { description: '  ', id: 'r1', name: 'Signers' },
        { id: 'r2', name: 'Reviewers', permissions: [] }
    ],
    groups: [{ id: 'g1', memberCount: 2, members: [], name: 'Sales' }],
    id: 'o1',
    name: 'Acme',
    status: 'inactive',
    ungroupedMembers: [ADA]
};

describe('OrganizationSummaryCardsService', () => {
    let service: OrganizationSummaryCardsService;
    const onRoleClick = jest.fn();

    function build(summary: OrganizationSummary = SUMMARY): ReturnType<OrganizationSummaryCardsService['buildView']> {
        return service.buildView(PREFIX, summary, { language: 'es', onRoleClick });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(OrganizationSummaryCardsService);
        onRoleClick.mockClear();
    });

    it('dates the creation in the language given', () => {
        expect(build().createdAtParameters).toEqual({ date: '12 de octubre de 2026' });
    });

    it('picks the singular or the plural key of every count', () => {
        const { groups, stats } = build();

        expect(stats.items.map(({ label, value }) => [label, value])).toEqual([
            [`${PREFIX}.stats.members.other`, 3],
            [`${PREFIX}.stats.groups.one`, 1],
            [`${PREFIX}.stats.extra-roles.other`, 2]
        ]);
        expect(groups.items.map(({ subtitle, subtitleParameters }) => [subtitle, subtitleParameters])).toEqual([
            [`${PREFIX}.groups.members.other`, { count: 2 }],
            [`${PREFIX}.groups.members.one`, { count: 1 }]
        ]);
    });

    it('folds the members of every group that has some, with the texts of the summary, and the ungrouped ones last', () => {
        const grace = { email: 'grace@example.test', id: 'u2', name: 'Grace', surname: 'Hopper' };
        const [sales, support, ungrouped] = build({
            ...SUMMARY,
            groups: [
                { id: 'g1', memberCount: 1, members: [grace], name: 'Sales' },
                { id: 'g2', memberCount: 0, members: [], name: 'Support' }
            ]
        }).groups.items;

        expect(sales.fold).toMatchObject({
            hideLabel: `${PREFIX}.groups.hide-members`,
            isOpen: false,
            showLabel: `${PREFIX}.groups.show-members`
        });
        expect(support.fold).toBeUndefined();
        expect(ungrouped.title).toBe(`${PREFIX}.groups.ungrouped`);
        expect(ungrouped.fold?.items.map(({ subtitle, title }) => [title, subtitle])).toEqual([
            ['Ada', 'ada@example.test']
        ]);
    });

    it('counts the members of a group from its list, and nobody out of the groups, when the server answers neither', () => {
        const { groups } = build({
            ...SUMMARY,
            groups: [{ id: 'g1', members: [ADA, { ...ADA, id: 'u2' }], name: 'Sales' }],
            ungroupedMembers: undefined
        });

        expect(groups.items.map(({ subtitleParameters, title }) => [title, subtitleParameters])).toEqual([
            ['Sales', { count: 2 }]
        ]);
    });

    it('counts the administrators it lists', () => {
        expect(build({ ...SUMMARY, administrators: [ADA] }).administrators.count).toBe(1);
    });

    it('leaves out a blank description, and opens only the roles answered with their permissions', () => {
        const [signers, reviewers] = build().extraRoles.items;

        expect(signers.subtitle).toBeUndefined();
        expect(signers.onClick).toBeUndefined();

        reviewers.onClick?.();

        expect(onRoleClick).toHaveBeenCalledWith(SUMMARY.extraRoles[1]);
    });
});
