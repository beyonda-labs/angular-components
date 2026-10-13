import { inject, Injectable } from '@angular/core';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormRow, FormSection } from '../../form/models/form.model';
import { toShareFormValue } from '../functions/page-shares';
import { PAGE_FORM_CANCEL_LABEL, PAGE_FORM_SUBMIT_LABEL } from '../models/page-form.model';
import {
    PAGE_SHARE_FORM_PREFIX as PREFIX,
    PageInheritedShare,
    PageShareAccess,
    PageShareChoice,
    PageShareFormValue,
    PageShareGranteeType,
    PageShareSection
} from '../models/page-sharing.model';

const FIELDS_PER_ROW = 2;
const SECTIONS: PageShareSection[] = ['groups', 'users'];

@Injectable({
    providedIn: 'root'
})
export class PageShareFormService {
    private readonly translateService = inject(TranslateService);

    buildShareForm(
        folderName: string,
        choices: PageShareChoice[],
        inherited: PageInheritedShare[]
    ): ModalFormConfig<PageShareFormValue> {
        const choiceSections = SECTIONS.map(section => choices.filter(choice => choice.section === section))
            .filter(sectionChoices => sectionChoices.length > 0)
            .map(sectionChoices => this.buildChoicesSection(sectionChoices));

        return new ModalFormConfig<PageShareFormValue>({
            cancelLabel: PAGE_FORM_CANCEL_LABEL,
            initialValue: toShareFormValue(choices),
            prefix: PREFIX,
            sections: [
                this.buildIntroSection(),
                ...(inherited.length > 0 ? [this.buildInheritedSection(inherited)] : []),
                ...(choiceSections.length > 0 ? choiceSections : [buildEmptySection()])
            ],
            submitLabel: PAGE_FORM_SUBMIT_LABEL,
            title: this.translate(`${PREFIX}.title`, { name: folderName })
        });
    }

    private buildChoiceField(choice: PageShareChoice): FormSelectField {
        const { email, field, inherited, name, options } = choice;

        return new FormSelectField({
            columns: 6,
            hint: email,
            isDisabled: options.length === 0,
            key: field,
            label: name,
            options: options.map(access => ({ label: accessLabel(access), value: access })),
            placeholder: inherited
                ? this.translate(`${PREFIX}.access.inherited`, {
                      access: this.translate(accessLabel(inherited.access)),
                      folder: inherited.folderName
                  })
                : `${PREFIX}.access.none`
        });
    }

    private buildChoicesSection(choices: PageShareChoice[]): FormSection {
        const fields = choices.map(choice => this.buildChoiceField(choice));
        const rows = Array.from(
            { length: Math.ceil(fields.length / FIELDS_PER_ROW) },
            (_, index) => new FormRow({ fields: fields.slice(index * FIELDS_PER_ROW, (index + 1) * FIELDS_PER_ROW) })
        );

        return new FormSection({ key: choices[0].section, rows });
    }

    private buildInheritedSection(inherited: PageInheritedShare[]): FormSection {
        const items = inherited.map(share =>
            this.translate(
                `${PREFIX}.inherited.${share.granteeType === PageShareGranteeType.Group ? 'group' : 'user'}`,
                {
                    access: this.translate(accessLabel(share.access)),
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

    private translate(key: string, parameters?: Record<string, unknown>): string {
        return this.translateService.instant(key, parameters) as string;
    }
}

function accessLabel(access: PageShareAccess): string {
    return `${PREFIX}.access.${access}`;
}

function buildEmptySection(): FormSection {
    return new FormSection({
        key: 'targets',
        rows: [
            new FormRow({
                fields: [
                    new FormListField({
                        isLabelVisible: false,
                        key: 'targets',
                        label: `${PREFIX}.targets.label`,
                        placeholder: `${PREFIX}.empty`
                    })
                ]
            })
        ]
    });
}
