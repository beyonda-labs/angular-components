import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
    BeyFormButton,
    BeyFormButtonType,
    BeyFormComponent,
    BeyFormConfig,
    BeyFormFooter,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyModalFormConfig,
    BeyModalFormService
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';
import { STYLE_GUIDE_REGIONS, StyleGuideRegion } from './form-style-guide.dependent-sections';
import { buildStyleGuideSections } from './form-style-guide.sections';

const PREFIX = 'angular-components-style-guide.form';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyFormComponent, TranslateModule],
    selector: 'bey-form-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './form-style-guide.component.html'
})
export class FormStyleGuideComponent {
    private readonly modalFormService = inject(BeyModalFormService);

    readonly regions = signal<StyleGuideRegion[]>([]);
    readonly config = new BeyFormConfig({
        buttons: [
            new BeyFormButton({ label: `${PREFIX}.button.cancel`, type: BeyFormButtonType.Cancel }),
            new BeyFormButton({ label: `${PREFIX}.button.submit`, type: BeyFormButtonType.Submit })
        ],
        footer: new BeyFormFooter({ note: `${PREFIX}.footer.note` }),
        initialValue: {
            'section-text': { text1: '', text2: '', text3: '', text4: 'Disabled value', text5: '' },
            'section-password': {
                password1: '',
                password2: '',
                password3: 'disabledpass',
                password4: '',
                password5: ''
            },
            'section-date': { date1: '', date2: '', date3: '2026-06-15' },
            'section-number': { number1: null, number2: null, number3: 25 },
            'section-select': { select1: '', select2: '', select3: 'option1' },
            'section-radio': { radio1: '', radio2: '' },
            'section-textarea': { textarea1: '', textarea2: '', textarea3: 'Disabled long text' },
            'section-checkbox': { checkbox1: false, checkbox2: false, checkbox3: true, checkbox4: false },
            'section-chips': { chips1: [], chips2: [], chips3: ['Angular', 'TypeScript'] },
            'section-dependent': { plan: '', region: '', seats: null }
        },
        onCancel: () => this.lastEvent.set(`${PREFIX}.canceled`),
        onSubmit: () => this.lastEvent.set(`${PREFIX}.submitted`),
        onValueChange: () => this.lastEvent.set(`${PREFIX}.changed`),
        prefix: PREFIX,
        sections: buildStyleGuideSections(this.regions)
    });
    readonly lastEvent = signal('');
    readonly loadRegionsButton: StyleGuideButton = {
        action: () => this.regions.set(STYLE_GUIDE_REGIONS),
        isPrimary: false,
        label: `${PREFIX}.section-dependent.load-regions`
    };
    readonly modalFormButton: StyleGuideButton = {
        action: () => this.openModalForm(),
        isPrimary: true,
        label: `${PREFIX}.modal.open`
    };

    openModalForm(): void {
        this.modalFormService.open(
            new BeyModalFormConfig({
                initialValue: { contact: { email: '', name: 'Beyonda' } },
                onSubmit: (_value, handle) => {
                    this.lastEvent.set(`${PREFIX}.modal.submitted`);
                    handle.close();
                },
                prefix: `${PREFIX}.modal`,
                sections: [
                    new BeyFormSection({
                        key: 'contact',
                        rows: [
                            new BeyFormRow({
                                fields: [
                                    new BeyFormTextField({ key: 'name', columns: 6, isRequired: true }),
                                    new BeyFormTextField({ key: 'email', columns: 6, isRequired: true })
                                ]
                            })
                        ]
                    })
                ]
            })
        );
    }
}
