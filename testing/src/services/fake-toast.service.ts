import { Injectable, signal } from '@angular/core';
import { BeyToastConfigParameters } from '@beyonda-labs/angular-components';

@Injectable()
export class FakeToastService {
    private readonly _errors = signal<BeyToastConfigParameters[]>([]);
    private readonly _infos = signal<BeyToastConfigParameters[]>([]);
    private readonly _successes = signal<BeyToastConfigParameters[]>([]);
    private readonly _warnings = signal<BeyToastConfigParameters[]>([]);

    readonly errors = this._errors.asReadonly();
    readonly infos = this._infos.asReadonly();
    readonly successes = this._successes.asReadonly();
    readonly warnings = this._warnings.asReadonly();

    showError(config: BeyToastConfigParameters): void {
        this._errors.update(errors => [...errors, config]);
    }

    showInfo(config: BeyToastConfigParameters): void {
        this._infos.update(infos => [...infos, config]);
    }

    showSuccess(config: BeyToastConfigParameters): void {
        this._successes.update(successes => [...successes, config]);
    }

    showWarning(config: BeyToastConfigParameters): void {
        this._warnings.update(warnings => [...warnings, config]);
    }
}
