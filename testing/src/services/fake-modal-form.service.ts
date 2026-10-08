import { Injectable, signal } from '@angular/core';
import { BeyModalFormConfig, BeyModalFormService } from '@beyonda-labs/angular-components';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, take } from 'rxjs';

@Injectable()
export class FakeModalFormService implements Pick<BeyModalFormService, 'canDeactivate' | 'open' | 'openWithRequest'> {
    private readonly _forms = signal<BeyModalFormConfig[]>([]);

    readonly forms = this._forms.asReadonly();

    canDeactivate(): boolean {
        return true;
    }

    open<TValue>(config: BeyModalFormConfig<TValue>): BsModalRef {
        this._forms.update(forms => [...forms, config as BeyModalFormConfig]);

        return new BsModalRef();
    }

    openWithRequest<TValue>(
        config: BeyModalFormConfig<TValue>,
        submit: (value: TValue) => Observable<unknown>
    ): BsModalRef {
        return this.open(
            new BeyModalFormConfig<TValue>({
                ...config,
                onSubmit: (value, handle) =>
                    submit(value)
                        .pipe(take(1))
                        .subscribe(() => handle.close())
            })
        );
    }
}
