import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

import { UNKNOWN_USER_NAME_KEY } from '../../../../internal/user-name/models/user-name.model';
import { ModalFormConfig, ModalFormSize } from '../../../form/components/modal/models/modal-form.model';
import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormNoticeField } from '../../../form/models/fields/form-notice-field.model';
import { FormFooter, FormRow, FormSection } from '../../../form/models/form.model';
import { NoticeVariant } from '../../../notice/models/notice.model';
import { contentCountLines, sumContentCounts } from '../../functions/content-counts';
import { userContactLabel, userDisplayName } from '../../functions/user-names';
import { ContentTranslate } from '../../models/content-counts.model';
import { usedByOthersLines } from '../functions/user-content';
import {
    UserContentFormOptions,
    UserDeleteFormOptions,
    USERS_FORM_SECTION,
    USERS_TRANSFER_TARGETS_LIMIT,
    UserStatus,
    UserTransferFormOptions,
    UserTransferFormValue,
    UserTransferTarget
} from '../models/users.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SEVERAL = 'other';
const SINGLE = 'one';

@Injectable({
    providedIn: 'root'
})
export class UserContentFormService {
    private readonly translateService = inject(TranslateService);

    buildDeleteConfig({ contentLabels, contents, prefix, users }: UserDeleteFormOptions): ModalFormConfig {
        const translate = this.translator();
        const amount = users.length === 1 ? SINGLE : SEVERAL;
        const invited = users.filter(({ status }) => status === UserStatus.Invited);
        const usedByOthers = usedByOthersLines(contents, { contentLabels, prefix }, translate);
        const parameters = { count: users.length, name: users.length === 1 ? userDisplayName(users[0]) : '' };

        return new ModalFormConfig({
            allowSubmitWithoutChanges: true,
            cancelLabel: CANCEL_LABEL_KEY,
            isSubmitDanger: true,
            prefix: `${prefix}.delete`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: USERS_FORM_SECTION,
                    rows: [
                        buildTextRow('message', translate(`${prefix}.delete.message.${amount}`, parameters)),
                        ...(invited.length > 0
                            ? [
                                  buildTextRow(
                                      'invitation',
                                      translate(
                                          `${prefix}.delete.invitation.${invited.length === 1 ? SINGLE : SEVERAL}`
                                      )
                                  )
                              ]
                            : []),
                        this.buildContentRow(sumContentCounts(contents.map(({ counts }) => counts)), {
                            contentLabels,
                            prefix
                        }),
                        ...(usedByOthers.length > 0
                            ? [
                                  new FormRow({
                                      fields: [
                                          new FormNoticeField({
                                              key: 'usedByOthersNotice',
                                              message: `${prefix}.delete.used-by-others`,
                                              messageParameters: { unknown: translate(UNKNOWN_USER_NAME_KEY) },
                                              variant: NoticeVariant.Warning
                                          })
                                      ]
                                  }),
                                  new FormRow({
                                      fields: [new FormListField({ items: usedByOthers, key: 'usedByOthers' })]
                                  })
                              ]
                            : [])
                    ]
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: `${prefix}.delete.submit`,
            title: translate(`${prefix}.delete.title.${amount}`, parameters)
        });
    }

    buildTransferConfig({
        content,
        contentLabels,
        prefix,
        searchTargets,
        user
    }: UserTransferFormOptions): ModalFormConfig<UserTransferFormValue> {
        const translate = this.translator();
        const name = userDisplayName(user);

        return new ModalFormConfig<UserTransferFormValue>({
            cancelLabel: CANCEL_LABEL_KEY,
            footer: new FormFooter({ note: translate(`${prefix}.transfer.note`, { name }) }),
            initialValue: { [USERS_FORM_SECTION]: { targetUserId: '' } },
            prefix: `${prefix}.transfer`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: USERS_FORM_SECTION,
                    rows: [
                        this.buildContentRow(content.counts, { contentLabels, prefix }),
                        new FormRow({
                            fields: [
                                new FormAutocompleteField({
                                    emptyKey: `${prefix}.transfer.no-targets`,
                                    isRequired: true,
                                    key: 'targetUserId',
                                    search: text => searchTargetOptions(searchTargets, text)
                                })
                            ]
                        })
                    ]
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: `${prefix}.transfer.submit`,
            title: translate(`${prefix}.transfer.title`, { name })
        });
    }

    private buildContentRow(
        counts: Readonly<Record<string, number>>,
        { contentLabels, prefix }: UserContentFormOptions
    ): FormRow {
        return new FormRow({
            fields: [
                new FormListField({
                    emptyKey: `${prefix}.content.empty`,
                    items: contentCountLines(
                        counts,
                        { contentLabels, countKey: `${prefix}.content.count` },
                        this.translator()
                    ),
                    key: 'content',
                    label: `${prefix}.content.label`
                })
            ]
        });
    }

    private translator(): ContentTranslate {
        return (key, parameters) => this.translateService.instant(key, parameters) as string;
    }
}

function buildTextRow(key: string, text: string): FormRow {
    return new FormRow({ fields: [new FormInfoField({ isLabelVisible: false, items: [{ label: text }], key })] });
}

function searchTargetOptions(
    searchTargets: (search: string, limit: number) => Observable<UserTransferTarget[]>,
    text: string
): Observable<FormAutocompleteSearchResult> {
    return searchTargets(text, USERS_TRANSFER_TARGETS_LIMIT).pipe(
        map(targets => ({
            hasMore: targets.length >= USERS_TRANSFER_TARGETS_LIMIT,
            options: targets.map(target => ({ label: userContactLabel(target), value: target.id }))
        }))
    );
}
