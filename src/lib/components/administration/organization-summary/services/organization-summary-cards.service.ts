import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AvatarConfig, AvatarVariant } from '../../../cards/avatar/models/avatar.model';
import { CardConfig } from '../../../cards/card/models/card.model';
import { CardListConfig, CardListFold, CardListItem } from '../../../cards/card-list/models/card-list.model';
import { CardStat, CardStatsConfig } from '../../../cards/card-stats/models/card-stats.model';
import { userFullName } from '../../functions/user-names';
import {
    ORGANIZATION_SUMMARY_BREAKDOWN_SEPARATOR,
    ORGANIZATION_SUMMARY_COUNT_ONE,
    ORGANIZATION_SUMMARY_COUNT_OTHER,
    ORGANIZATION_SUMMARY_GROUP_ICON,
    ORGANIZATION_SUMMARY_ROLE_ICON,
    ORGANIZATION_SUMMARY_STATS,
    ORGANIZATION_SUMMARY_STATUS_KEYS,
    ORGANIZATION_SUMMARY_UNGROUPED_KEY,
    OrganizationSummary,
    OrganizationSummaryCounts,
    OrganizationSummaryExtraRole,
    OrganizationSummaryGroup,
    OrganizationSummaryMember,
    OrganizationSummaryStatusCounts,
    OrganizationSummaryView,
    OrganizationSummaryViewOptions
} from '../models/organization-summary.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationSummaryCardsService {
    private readonly translateService = inject(TranslateService);

    buildView(
        prefix: string,
        summary: OrganizationSummary,
        { language, onRoleClick }: OrganizationSummaryViewOptions
    ): OrganizationSummaryView {
        const { administrators, counts, extraRoles, name } = summary;

        return {
            administrators: new CardListConfig({
                count: administrators.length,
                emptyLabel: `${prefix}.administrators.empty`,
                items: administrators.map(administrator => buildMemberItem(administrator)),
                title: `${prefix}.administrators.label`
            }),
            breakdown: counts.byStatus ? this.buildBreakdown(prefix, counts.byStatus) : '',
            card: new CardConfig(),
            createdAtParameters: { date: formatSummaryDate(summary.createdAt, language) },
            extraRoles: new CardListConfig({
                count: counts.extraRoles,
                emptyLabel: `${prefix}.extra-roles.empty`,
                items: extraRoles.map(role => buildRoleItem(role, onRoleClick)),
                title: `${prefix}.extra-roles.label`
            }),
            groups: new CardListConfig({
                count: counts.groups,
                emptyLabel: `${prefix}.groups.empty`,
                items: buildGroupItems(prefix, summary),
                title: `${prefix}.groups.label`
            }),
            name,
            stats: new CardStatsConfig({ items: buildStats(prefix, counts) })
        };
    }

    private buildBreakdown(prefix: string, byStatus: OrganizationSummaryStatusCounts): string {
        return ORGANIZATION_SUMMARY_STATUS_KEYS.filter(key => byStatus[key] > 0)
            .map(
                key =>
                    this.translateService.instant(countKey(`${prefix}.breakdown.${key}`, byStatus[key]), {
                        count: byStatus[key]
                    }) as string
            )
            .join(ORGANIZATION_SUMMARY_BREAKDOWN_SEPARATOR);
    }
}

function buildGroupItem(
    prefix: string,
    { id, members, memberCount = members.length, name }: OrganizationSummaryGroup
): CardListItem {
    const groupsPrefix = `${prefix}.groups`;

    return new CardListItem({
        fold:
            members.length > 0
                ? new CardListFold({
                      emptyLabel: `${groupsPrefix}.no-members`,
                      hideLabel: `${groupsPrefix}.hide-members`,
                      items: members.map(member => buildMemberItem(member)),
                      showLabel: `${groupsPrefix}.show-members`
                  })
                : undefined,
        icon: ORGANIZATION_SUMMARY_GROUP_ICON,
        key: id,
        subtitle: countKey(`${groupsPrefix}.members`, memberCount),
        subtitleParameters: { count: memberCount },
        title: name
    });
}

function buildGroupItems(prefix: string, { groups, ungroupedMembers = [] }: OrganizationSummary): CardListItem[] {
    const items = groups.map(group => buildGroupItem(prefix, group));

    return ungroupedMembers.length > 0
        ? [
              ...items,
              buildGroupItem(prefix, {
                  id: ORGANIZATION_SUMMARY_UNGROUPED_KEY,
                  memberCount: ungroupedMembers.length,
                  members: ungroupedMembers,
                  name: `${prefix}.groups.ungrouped`
              })
          ]
        : items;
}

function buildMemberItem(member: OrganizationSummaryMember): CardListItem {
    const fullName = userFullName(member);

    return new CardListItem({
        avatar: new AvatarConfig({
            name: fullName ? (member.name ?? '') : member.email,
            surname: fullName ? (member.surname ?? '') : '',
            variant: AvatarVariant.Soft
        }),
        key: member.id,
        subtitle: fullName ? member.email : undefined,
        title: fullName || member.email
    });
}

function buildRoleItem(
    role: OrganizationSummaryExtraRole,
    onRoleClick: (role: OrganizationSummaryExtraRole) => void
): CardListItem {
    return new CardListItem({
        icon: ORGANIZATION_SUMMARY_ROLE_ICON,
        key: role.id,
        onClick: role.permissions ? (): void => onRoleClick(role) : undefined,
        subtitle: role.description?.trim() || undefined,
        title: role.name
    });
}

function buildStats(prefix: string, counts: OrganizationSummaryCounts): CardStat[] {
    return ORGANIZATION_SUMMARY_STATS.map(
        ({ icon, key, textKey }) =>
            new CardStat({
                icon,
                key,
                label: countKey(`${prefix}.stats.${textKey}`, counts[key]),
                value: counts[key]
            })
    );
}

function countKey(key: string, count: number): string {
    return `${key}.${count === 1 ? ORGANIZATION_SUMMARY_COUNT_ONE : ORGANIZATION_SUMMARY_COUNT_OTHER}`;
}

function formatSummaryDate(timestamp: number, language: string): string {
    return new Intl.DateTimeFormat(language || undefined, { dateStyle: 'long' }).format(new Date(timestamp));
}
