import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { isObservable, Observable, of, switchMap, tap } from 'rxjs';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { ModalFormService } from '../../form/components/modal/services/modal-form.service';
import { FormHandle } from '../../form/models/form.model';
import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { ModalService } from '../../modal/services/modal.service';
import { PageFormConfig, PageSaveMode } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';

const CANCEL_LABEL_KEY = 'angular-components.page.form.cancel';
const SUBMIT_LABEL_KEY = 'angular-components.page.form.submit';

@Injectable({
    providedIn: 'root'
})
export class PageFormService {
    private readonly modalFormService = inject(ModalFormService);
    private readonly modalService = inject(ModalService);

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

                    this.confirmSave(pageForm, value, item).subscribe(isConfirmed => {
                        if (isConfirmed) {
                            callback?.(value, handle);
                            onSave(pageForm.toItem(value), handle);
                        }
                    });
                },
                onValueChange: (value, handle) => pageForm.onValueChange?.(value, handle),
                prefix: pageForm.prefix,
                sections: pageForm.buildSections(item),
                submitLabel: SUBMIT_LABEL_KEY,
                title: `${pagePrefix}.form.${mode}.title`
            })
        );
    }

    openWithRequest<TValue>(
        config: ModalFormConfig<TValue>,
        submit: (value: TValue) => Observable<unknown>,
        onSaved: () => void
    ): BsModalRef<ModalFormDialogComponent> {
        return this.modalFormService.openWithRequest(config, value => submit(value).pipe(tap(() => onSaved())));
    }

    private confirmSave<TValue>(
        pageForm: PageFormConfig<TValue>,
        value: TValue,
        item: PageItem | undefined
    ): Observable<boolean> {
        const confirmation = pageForm.confirmSave?.(value, item) ?? null;

        return (isObservable(confirmation) ? confirmation : of(confirmation)).pipe(
            switchMap((config: ConfirmationModalConfig | null) =>
                config ? this.modalService.openConfirmation(config) : of(true)
            )
        );
    }
}
