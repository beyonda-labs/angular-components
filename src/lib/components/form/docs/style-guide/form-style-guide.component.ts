import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { ModalFormConfig } from '../../components/modal/models/modal-form.model';
import { ModalFormService } from '../../components/modal/services/modal-form.service';
import { FormComponent } from '../../form.component';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../models/form.model';
import { buildStyleGuideSections } from './form-style-guide.sections';

const PREFIX = 'angular-components-style-guide.form';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FormComponent, TranslateModule],
    selector: 'bey-form-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './form-style-guide.component.html'
})
export class FormStyleGuideComponent {
    readonly lastEvent = signal('');

    readonly config = new FormConfig({
        buttons: [
            new FormButton({ label: `${PREFIX}.button.cancel`, type: FormButtonType.Cancel }),
            new FormButton({ label: `${PREFIX}.button.submit`, type: FormButtonType.Submit })
        ],
        initialValue: {
            'section-text': { text1: '', text2: '', text3: '', text4: 'Disabled value', text5: '' },
            'section-password': { password1: '', password2: '', password3: 'disabledpass', password4: '' },
            'section-date': { date1: '', date2: '', date3: '2026-06-15' },
            'section-number': { number1: null, number2: null, number3: 25 },
            'section-select': { select1: '', select2: '', select3: 'option1' },
            'section-radio': { radio1: '', radio2: '' },
            'section-textarea': { textarea1: '', textarea2: '', textarea3: 'Disabled long text' },
            'section-checkbox': { checkbox1: false, checkbox2: false, checkbox3: true, checkbox4: false },
            'section-chips': { chips1: [], chips2: [], chips3: ['Angular', 'TypeScript'] }
        },
        onCancel: () => this.lastEvent.set(`${PREFIX}.canceled`),
        onSubmit: () => this.lastEvent.set(`${PREFIX}.submitted`),
        onValueChange: () => this.lastEvent.set(`${PREFIX}.changed`),
        prefix: PREFIX,
        sections: buildStyleGuideSections()
    });
    readonly modalFormButton = new ButtonConfig({
        action: () => this.openModalForm(),
        label: `${PREFIX}.modal.open`,
        type: ButtonType.Primary
    });

    private readonly modalFormService = inject(ModalFormService);

    openModalForm(): void {
        this.modalFormService.open(
            new ModalFormConfig({
                initialValue: { contact: { email: '', name: 'Beyonda' } },
                onSubmit: (_value, handle) => {
                    this.lastEvent.set(`${PREFIX}.modal.submitted`);
                    handle.close();
                },
                prefix: `${PREFIX}.modal`,
                sections: [
                    new FormSection({
                        key: 'contact',
                        rows: [
                            new FormRow({
                                fields: [
                                    new FormTextField({ key: 'name', columns: 6, isRequired: true }),
                                    new FormTextField({ key: 'email', columns: 6, isRequired: true })
                                ]
                            })
                        ]
                    })
                ]
            })
        );
    }
}
