import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { ModalFormService } from '../../form/components/modal/services/modal-form.service';
import { FormHandle } from '../../form/models/form.model';
import { PageFormConfig, PageSaveMode } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class PageFormService {
    private readonly modalFormService = inject(ModalFormService);

    open<TValue>(
        pageForm: PageFormConfig<TValue>,
        item: PageItem | undefined,
        pagePrefix: string,
        onSave: (value: unknown, handle: FormHandle<TValue>) => void
    ): BsModalRef<ModalFormDialogComponent> {
        const mode: PageSaveMode = item ? 'edit' : 'create';

        return this.modalFormService.open(
            new ModalFormConfig<TValue>({
                allowSubmitWithoutChanges: pageForm.allowSubmitWithoutChanges,
                cancelLabel: CANCEL_LABEL_KEY,
                initialValue: pageForm.toFormValue(item),
                onReady: handle => pageForm.onReady?.(handle),
                onSubmit: (value, handle) => {
                    const callback = item ? pageForm.onEdit : pageForm.onCreate;

                    callback?.(value, handle);
                    onSave(pageForm.toItem(value), handle);
                },
                prefix: pageForm.prefix,
                sections: pageForm.buildSections(item),
                submitLabel: SUBMIT_LABEL_KEY,
                title: `${pagePrefix}.form.${mode}.title`
            })
        );
    }
}
