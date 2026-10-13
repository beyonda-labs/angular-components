import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { accessibleDescription, accessibleName, queryAll, renderComponent, settle, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import cardsEn from '../../cards/assets/cards.en.json';
import organizationSummaryEn from './assets/organization-summary.en.json';
import { OrganizationSummary, OrganizationSummaryConfig } from './models/organization-summary.model';
import { OrganizationSummaryComponent } from './organization-summary.component';

const ADA = { email: 'ada@example.test', id: 'u1', name: 'Ada', surname: 'Lovelace' };
const GRACE = { email: 'grace@example.test', id: 'u2', name: null, surname: null };
const SUMMARY: OrganizationSummary = {
    administrators: [ADA, GRACE],
    counts: { extraRoles: 2, groups: 3, members: 12 },
    createdAt: Date.UTC(2026, 0, 2, 12),
    extraRoles: [],
    groups: [],
    id: 'o1',
    name: 'Acme',
    status: 'active',
    ungroupedMembers: []
};
const SUMMARY_URL = 'https://api.test/api/organizations/current';
const TEXTS = {
    'angular-components': {
        ...cardsEn['angular-components'],
        ...organizationSummaryEn['angular-components']
    }
};

describe('OrganizationSummaryComponent', () => {
    let fixture: ComponentFixture<OrganizationSummaryComponent>;
    let httpTesting: HttpTestingController;

    function itemsOf(title: string): string[] {
        const section = queryAll(fixture, 'section').find(element => accessibleName(element) === title);

        return section ? queryAll(section, 'li').map(item => visibleText(item)) : [];
    }

    async function render(
        summary: OrganizationSummary = SUMMARY,
        config = new OrganizationSummaryConfig(),
        url = SUMMARY_URL
    ): Promise<void> {
        fixture = await renderComponent(OrganizationSummaryComponent, { config });
        httpTesting.expectOne(url).flush(summary);
        await settle(fixture);
    }

    function text(): string {
        return visibleText(fixture);
    }

    function textsOfStats(): string[] {
        const [stats] = queryAll(fixture, 'bey-card-stats');

        return queryAll(stats, 'li').map(item => visibleText(item));
    }

    function toggleOf(group: string): HTMLButtonElement {
        const toggle = queryAll<HTMLButtonElement>(fixture, 'button[aria-expanded]').find(
            button => accessibleDescription(button) === group
        );

        if (!toggle) {
            throw new Error(`No toggle for ${group}`);
        }

        return toggle;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationSummaryComponent],
            providers: [provideRouter([]), provideBeyTesting({ translations: { en: TEXTS } })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('titles the page above the card, and shows the name of the organization, its creation and its figures', async () => {
        await render();

        expect(visibleText(queryAll(fixture, 'bey-header')[0])).toBe('Organization');
        expect(text()).toContain('Acme Created on January 2, 2026');
        expect(text()).not.toContain('Active');
        expect(textsOfStats()).toEqual(['12 Members', '3 Groups', '2 Additional roles']);
        expect(text()).not.toContain('pending');
        expect(queryAll(fixture, 'input, button')).toEqual([]);
    });

    it('names each figure in the singular when it counts one', async () => {
        await render({ ...SUMMARY, counts: { extraRoles: 1, groups: 1, members: 1 } });

        expect(textsOfStats()).toEqual(['1 Member', '1 Group', '1 Additional role']);
    });

    it('lists the administrators with their initials, their name and their email, or their email alone', async () => {
        await render();

        expect(itemsOf('Administrators')).toEqual(['AL Ada Lovelace ada@example.test', 'G grace@example.test']);
    });

    it('counts the members by status for whoever may see the users, leaving out the statuses with none', async () => {
        await render({
            ...SUMMARY,
            counts: { ...SUMMARY.counts, byStatus: { active: 9, inactive: 1, invited: 2, unverified: 0 } }
        });

        expect(text()).toContain('9 active · 1 inactive · 2 pending invitations');
        expect(text()).not.toContain('unverified');
    });

    it('lists each group folded with its count of members, unfolds its members in place, and folds no empty group', async () => {
        await render({
            ...SUMMARY,
            groups: [
                { id: 'g1', memberCount: 1, members: [ADA], name: 'Sales' },
                { id: 'g2', memberCount: 0, members: [], name: 'Support' }
            ]
        });

        expect(itemsOf('Groups')).toEqual(['Sales 1 member Show members', 'Support 0 members']);

        toggleOf('Sales').click();
        await settle(fixture);

        expect(toggleOf('Sales').getAttribute('aria-expanded')).toBe('true');
        expect(itemsOf('Groups')).toEqual([
            'Sales 1 member Hide members AL Ada Lovelace ada@example.test',
            'AL Ada Lovelace ada@example.test',
            'Support 0 members'
        ]);
    });

    it('lists last, under "No group", the members in no group, only when there is someone', async () => {
        await render({
            ...SUMMARY,
            groups: [{ id: 'g1', memberCount: 1, members: [ADA], name: 'Sales' }],
            ungroupedMembers: [GRACE]
        });

        expect(itemsOf('Groups')).toEqual(['Sales 1 member Show members', 'No group 1 member Show members']);

        toggleOf('No group').click();
        await settle(fixture);

        expect(itemsOf('Groups')).toContain('G grace@example.test');
    });

    it('says so when the organization has no administrators, no groups, nobody out of them and no extra roles', async () => {
        await render({ ...SUMMARY, administrators: [] });

        expect(text()).toContain('No administrators yet.');
        expect(text()).toContain('This organization has no groups yet.');
        expect(text()).toContain('This organization has no additional roles yet.');
    });

    it('opens the permissions of a role the caller may see, and shows the others without any action', async () => {
        await render({
            ...SUMMARY,
            extraRoles: [
                {
                    description: 'Review the templates',
                    id: 'r1',
                    name: 'Reviewers',
                    permissions: ['templates.read']
                },
                { description: null, id: 'r2', name: 'Signers' }
            ]
        });

        expect(itemsOf('Additional roles')).toEqual(['Reviewers Review the templates', 'Signers']);
        const buttons = queryAll<HTMLButtonElement>(fixture, 'button');

        expect(buttons.map(button => accessibleName(button))).toEqual(['Reviewers']);

        buttons[0].click();
        await settle(fixture);
        const [view] = TestBed.inject(FakeModalFormService).forms();

        expect(view.prefix).toBe('angular-components.roles.view');
        expect(view.initialValue).toEqual({
            main: { description: 'Review the templates', name: 'Reviewers' },
            permissions: { permissions: ['templates.read'] }
        });
    });

    it('reads the summary under the address of the organizations the config gives', async () => {
        await render(
            SUMMARY,
            new OrganizationSummaryConfig({ organizationsUrl: '/companies' }),
            'https://api.test/api/companies/current'
        );

        expect(text()).toContain('Acme');
    });

    it('shows only the page title and the reason of the server when the caller has no summary to read', async () => {
        fixture = await renderComponent(OrganizationSummaryComponent, { config: new OrganizationSummaryConfig() });
        httpTesting.expectOne(SUMMARY_URL).flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        expect(text()).toBe('Organization');
        expect(TestBed.inject(FakeModalService).errors()).toHaveLength(1);
    });
});
