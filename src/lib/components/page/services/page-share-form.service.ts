import { inject, Injectable } from '@angular/core';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormAutocompleteSearchResult } from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption, FormValue } from '../../form/models/form-field.model';
import { coveredGrantees, shareGranteeValue, toShareFormValue } from '../functions/page-shares';
import { PAGE_FORM_CANCEL_LABEL, PAGE_FORM_SUBMIT_LABEL } from '../models/page-form.model';
import {
    PAGE_SHARE_FORM_PREFIX as PREFIX,
    PAGE_SHARE_FORM_SECTION as SECTION,
    PAGE_SHARE_SEARCH_LIMIT,
    PAGE_SHARE_SEARCH_MAX_LIMIT,
    PageInheritedShare,
    PageShare,
    PageShareAccess,
    PageShareFormOptions,
    PageShareFormValue,
    PageShareGranteeType,
    PageShareTarget,
    PageShareTargets
} from '../models/page-sharing.model';

const MEMBERS_ONE = 'one';
const MEMBERS_OTHER = 'other';

@Injectable({
    providedIn: 'root'
})
export class PageShareFormService {
    private readonly translateService = inject(TranslateService);

    buildShareForm({
        folderName,
        inherited,
        searchTargets,
        shares
    }: PageShareFormOptions): ModalFormConfig<PageShareFormValue> {
        const buildList = (access: PageShareAccess, other: PageShareAccess) =>
            this.buildGranteeList(access, other, { inherited, searchTargets, shares });

        return new ModalFormConfig<PageShareFormValue>({
            cancelLabel: PAGE_FORM_CANCEL_LABEL,
            initialValue: toShareFormValue(shares),
            prefix: PREFIX,
            sections: [
                this.buildIntroSection(),
                new FormSection({
                    isTitleVisible: false,
                    key: SECTION,
                    rows: [
                        new FormRow({ fields: [buildList(PageShareAccess.Read, PageShareAccess.Write)] }),
                        new FormRow({ fields: [buildList(PageShareAccess.Write, PageShareAccess.Read)] })
                    ]
                }),
                ...(inherited.length > 0 ? [this.buildInheritedSection(inherited)] : [])
            ],
            submitLabel: PAGE_FORM_SUBMIT_LABEL,
            title: this.translate(`${PREFIX}.title`, { name: folderName })
        });
    }

    private buildGranteeList(
        access: PageShareAccess,
        other: PageShareAccess,
        { inherited, searchTargets, shares }: Omit<PageShareFormOptions, 'folderName'>
    ): FormListField {
        const covered = coveredGrantees(inherited, access);

        return new FormListField({
            emptyKey: `${PREFIX}.${SECTION}.${access}.empty`,
            excludedValues: value => [...listedIn(value, other), ...covered],
            isRemovable: true,
            key: access,
            options: shares.filter(share => share.access === access).map(share => this.toShareOption(share)),
            picker: {
                emptyKey: `${PREFIX}.${SECTION}.no-match`,
                search: (text, excludedValues) => this.searchOptions(searchTargets, text, excludedValues)
            }
        });
    }

    private buildInheritedSection(inherited: PageInheritedShare[]): FormSection {
        const items = inherited.map(share =>
            this.translate(
                `${PREFIX}.inherited.${share.granteeType === PageShareGranteeType.Group ? 'group' : 'user'}`,
                {
                    access: this.translate(`${PREFIX}.access.${share.access}`),
                    folder: share.folderName,
                    name: share.granteeName
                }
            )
        );

        return new FormSection({
            key: 'inherited',
            rows: [
                new FormRow({
                    fields: [
                        new FormListField({
                            isLabelVisible: false,
                            items,
                            key: 'inherited',
                            label: `${PREFIX}.inherited.label`
                        })
                    ]
                })
            ]
        });
    }

    private buildIntroSection(): FormSection {
        return new FormSection({
            isTitleVisible: false,
            key: 'intro',
            rows: [
                new FormRow({
                    fields: [
                        new FormInfoField({
                            isLabelVisible: false,
                            items: [{ icon: faCircleInfo, label: this.translate(`${PREFIX}.intro`) }],
                            key: 'intro'
                        })
                    ]
                })
            ]
        });
    }

    private groupLabel(name: string, memberCount?: number): string {
        return memberCount === undefined
            ? this.translate(`${PREFIX}.grantee.group`, { name })
            : this.translate(`${PREFIX}.grantee.members.${memberCount === 1 ? MEMBERS_ONE : MEMBERS_OTHER}`, {
                  count: memberCount,
                  name
              });
    }

    private searchOptions(
        searchTargets: PageShareFormOptions['searchTargets'],
        text: string,
        excludedValues: string[]
    ): Observable<FormAutocompleteSearchResult> {
        const excluded = new Set(excludedValues);
        const limit = Math.min(PAGE_SHARE_SEARCH_MAX_LIMIT, PAGE_SHARE_SEARCH_LIMIT + excluded.size);

        return searchTargets(text, limit).pipe(
            map(targets => {
                const options = this.toTargetOptions(targets).filter(({ value }) => !excluded.has(value));

                return {
                    hasMore: (targets.hasMore ?? false) || options.length > PAGE_SHARE_SEARCH_LIMIT,
                    options: options.slice(0, PAGE_SHARE_SEARCH_LIMIT)
                };
            })
        );
    }

    private toShareOption(share: PageShare): FormFieldOption {
        const { granteeName, granteeType } = share;

        return {
            label: granteeType === PageShareGranteeType.Group ? this.groupLabel(granteeName) : granteeName,
            value: shareGranteeValue(share)
        };
    }

    private toTargetOptions({ groups, users }: PageShareTargets): FormFieldOption[] {
        return [
            ...groups.map(({ id, memberCount, name }) => ({
                label: this.groupLabel(name, memberCount),
                value: shareGranteeValue({ granteeId: id, granteeType: PageShareGranteeType.Group })
            })),
            ...users.map(user => ({
                label: userLabel(user),
                value: shareGranteeValue({ granteeId: user.id, granteeType: PageShareGranteeType.User })
            }))
        ];
    }

    private translate(key: string, parameters?: Record<string, unknown>): string {
        return this.translateService.instant(key, parameters) as string;
    }
}

function listedIn(value: FormValue, access: PageShareAccess): string[] {
    const listed = value[SECTION]?.[access];

    return Array.isArray(listed) ? (listed as string[]) : [];
}

function userLabel({ email, name }: PageShareTarget): string {
    return name && email && name !== email ? `${name} (${email})` : name || (email ?? '');
}
