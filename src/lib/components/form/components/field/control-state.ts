import { linkedSignal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { map, switchMap } from 'rxjs';

export interface ControlState<T> {
    isDisabled: WritableSignal<boolean>;
    value: WritableSignal<T>;
}

export function trackControl<T>(control: Signal<FormControl<T>>): ControlState<T> {
    const state: ControlState<T> = {
        isDisabled: linkedSignal(() => control().disabled),
        value: linkedSignal(() => control().value)
    };

    toObservable(control)
        .pipe(
            switchMap(current => current.events.pipe(map(() => current))),
            takeUntilDestroyed()
        )
        .subscribe(current => {
            state.isDisabled.set(current.disabled);
            state.value.set(current.value);
        });

    return state;
}
