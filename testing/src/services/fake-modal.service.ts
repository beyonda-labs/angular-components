import { Injectable, signal } from '@angular/core';
import {
    BeyConfirmationModalConfig,
    BeyModalService,
    BeyNotificationModalConfig
} from '@beyonda-labs/angular-components';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';

@Injectable()
export class FakeModalService
    implements Pick<BeyModalService, 'openConfirmation' | 'openError' | 'openInfo' | 'openWarning'>
{
    private readonly _confirmationAnswer = signal(false);
    private readonly _confirmations = signal<BeyConfirmationModalConfig[]>([]);
    private readonly _errors = signal<BeyNotificationModalConfig[]>([]);
    private readonly _infos = signal<BeyNotificationModalConfig[]>([]);
    private readonly _warnings = signal<BeyNotificationModalConfig[]>([]);

    readonly confirmations = this._confirmations.asReadonly();
    readonly errors = this._errors.asReadonly();
    readonly infos = this._infos.asReadonly();
    readonly warnings = this._warnings.asReadonly();

    openConfirmation(config: BeyConfirmationModalConfig): Observable<boolean> {
        this._confirmations.update(confirmations => [...confirmations, config]);

        return of(this._confirmationAnswer());
    }

    openError(config: BeyNotificationModalConfig): BsModalRef {
        this._errors.update(errors => [...errors, config]);

        return new BsModalRef();
    }

    openInfo(config: BeyNotificationModalConfig): BsModalRef {
        this._infos.update(infos => [...infos, config]);

        return new BsModalRef();
    }

    openWarning(config: BeyNotificationModalConfig): BsModalRef {
        this._warnings.update(warnings => [...warnings, config]);

        return new BsModalRef();
    }

    setConfirmationAnswer(answer: boolean): void {
        this._confirmationAnswer.set(answer);
    }
}
