import { inject, Injectable } from '@angular/core';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

import { UNKNOWN_USER_NAME_KEY } from '../../../internal/user-name/models/user-name.model';
import { ModalFormConfig, ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField, FormInfoItem } from '../../form/models/fields/form-info-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldOption } from '../../form/models/form-field.model';
import { PAGE_FORM_CANCEL_LABEL } from '../models/page-form.model';
import { PageOwner } from '../models/page-owner.model';
import {
    PAGE_TRANSFER_FORM_PREFIX as PREFIX,
    PAGE_TRANSFER_FORM_SECTION as SECTION,
    PAGE_TRANSFER_SEARCH_LIMIT,
    PageTransferFormOptions,
    PageTransferFormValue,
    PageTransferTarget
} from '../models/page-transfer.model';

const SEVERAL = 'other';
const SINGLE = 'one';

@Injectable({
    providedIn: 'root'
})
export class PageTransferFormService {
    private readonly translateService = inject(TranslateService);

    buildTransferForm({
        count,
        notice,
        owners,
        searchTargets
    }: PageTransferFormOptions): ModalFormConfig<PageTransferFormValue> {
        return new ModalFormConfig<PageTransferFormValue>({
            cancelLabel: PAGE_FORM_CANCEL_LABEL,
            initialValue: { [SECTION]: { targetUserId: '' } },
            prefix: PREFIX,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: SECTION,
                    rows: [
                        buildInfoRow('notice', { icon: faCircleInfo, label: this.translate(notice) }, false),
                        ...(owners.length > 0 ? [buildInfoRow('owner', { label: this.ownerText(owners) }, true)] : []),
                        new FormRow({
                            fields: [
                                new FormAutocompleteField({
                                    emptyKey: `${PREFIX}.no-targets`,
                                    isRequired: true,
                                    isTypeahead: true,
                                    key: 'targetUserId',
                                    search: text => searchOptions(searchTargets, text)
                                })
                            ]
                        })
                    ]
                })
            ],
            size: ModalFormSize.Medium,
            submitLabel: `${PREFIX}.submit`,
            title: this.translate(`${PREFIX}.title.${count === 1 ? SINGLE : SEVERAL}`, { count })
        });
    }

    private ownerText(owners: PageOwner[]): string {
        if (owners.length > 1) {
            return this.translate(`${PREFIX}.several-owners`);
        }

        return owners[0].name || this.translate(UNKNOWN_USER_NAME_KEY);
    }

    private translate(key: string, parameters?: Record<string, unknown>): string {
        return this.translateService.instant(key, parameters) as string;
    }
}

function buildInfoRow(key: string, item: FormInfoItem, isLabelVisible: boolean): FormRow {
    return new FormRow({ fields: [new FormInfoField({ isLabelVisible, items: [item], key })] });
}

function searchOptions(
    searchTargets: PageTransferFormOptions['searchTargets'],
    text: string
): Observable<FormAutocompleteSearchResult> {
    return searchTargets(text, PAGE_TRANSFER_SEARCH_LIMIT).pipe(
        map(({ hasMore = false, options }) => ({ hasMore, options: options.map(toOption) }))
    );
}

function toOption({ description, label, value }: PageTransferTarget): FormFieldOption {
    return { label: description && description !== label ? `${label} (${description})` : label, value };
}
