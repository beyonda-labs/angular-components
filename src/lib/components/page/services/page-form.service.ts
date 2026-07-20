import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { ModalFormService } from '../../form/components/modal/services/modal-form.service';
import { PageFormConfig, PageSaveMode } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class PageFormService {
    private readonly modalFormService = inject(ModalFormService);

    /**
     * Opens the create/edit modal form. The page form config decides how the form is initialized
     * (sections, steps, initial value and extra controls); `onSave` receives the submitted value
     * already mapped through `toItem` and is responsible for closing the modal on success.
     */
    open(
        pageForm: PageFormConfig,
        item: PageItem | undefined,
        pagePrefix: string,
        onSave: (value: unknown, form: ModalFormConfig) => void
    ): BsModalRef<ModalFormDialogComponent> {
        const mode: PageSaveMode = item ? 'edit' : 'create';

        return this.modalFormService.open(
            new ModalFormConfig({
                cancelLabel: CANCEL_LABEL_KEY,
                i18nPrefix: pageForm.prefix,
                initialValue: pageForm.toFormValue(item),
                onFormGroupAdded: (formGroup, form) => pageForm.onFormGroupAdded?.(formGroup, form),
                onSubmit: (currentValue, form) => {
                    const callback = item ? pageForm.onEdit : pageForm.onCreate;

                    callback?.(currentValue, form);
                    onSave(pageForm.toItem(currentValue), form);
                },
                sections: pageForm.buildSections(item),
                steps: pageForm.steps,
                submitLabel: SUBMIT_LABEL_KEY,
                title: `${pagePrefix}.form.${mode}.title`
            })
        );
    }
}
