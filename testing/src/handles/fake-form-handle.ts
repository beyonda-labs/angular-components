import { signal } from '@angular/core';
import { BeyFormHandle } from '@beyonda-labs/angular-components';

import { FakeFormHandleParameters } from '../models/testing.model';

export class FakeFormHandle<TValue = unknown> implements BeyFormHandle<TValue> {
    private readonly _closeRequests = signal(0);
    private readonly _closes = signal(0);
    private readonly _isDirty: boolean;
    private readonly _patches = signal<Partial<TValue>[]>([]);
    private readonly _resets = signal(0);
    private readonly _steps = signal<string[]>([]);
    private readonly _value = signal<TValue>(undefined as TValue);

    readonly closeRequests = this._closeRequests.asReadonly();
    readonly closes = this._closes.asReadonly();
    readonly patches = this._patches.asReadonly();
    readonly resets = this._resets.asReadonly();
    readonly steps = this._steps.asReadonly();

    constructor({ isDirty = true, value }: FakeFormHandleParameters<TValue> = {}) {
        this._isDirty = isDirty;
        this._value.set(value as TValue);
    }

    close(): void {
        this._closes.update(count => count + 1);
    }

    goToStep(key: string): void {
        this._steps.update(steps => [...steps, key]);
    }

    isDirty(): boolean {
        return this._isDirty;
    }

    patchValue(value: Partial<TValue>): void {
        this._patches.update(patches => [...patches, value]);
        this._value.update(current => ({ ...current, ...value }) as TValue);
    }

    requestClose(): void {
        this._closeRequests.update(count => count + 1);
    }

    reset(): void {
        this._resets.update(count => count + 1);
    }

    value(): TValue {
        return this._value();
    }
}
