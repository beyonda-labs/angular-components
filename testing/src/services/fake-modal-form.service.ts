import { Injectable, signal } from '@angular/core';
import { BeyModalFormConfig, BeyModalFormService } from '@beyonda-labs/angular-components';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Injectable()
export class FakeModalFormService implements Pick<BeyModalFormService, 'canDeactivate' | 'open'> {
    private readonly _forms = signal<BeyModalFormConfig[]>([]);

    readonly forms = this._forms.asReadonly();

    canDeactivate(): boolean {
        return true;
    }

    open<TValue>(config: BeyModalFormConfig<TValue>): BsModalRef {
        this._forms.update(forms => [...forms, config as BeyModalFormConfig]);

        return new BsModalRef();
    }
}
