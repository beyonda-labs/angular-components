import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { UnsavedChangesConfig } from '../models/unsaved-changes.model';
import { ModalService } from './modal.service';

interface UnsavedChangesSource {
    config: UnsavedChangesConfig;
    hasChanges: Signal<boolean>;
}

@Injectable({
    providedIn: 'root'
})
export class UnsavedChangesService {
    private readonly document = inject(DOCUMENT);
    private readonly modalService = inject(ModalService);

    private readonly _sources = signal<UnsavedChangesSource[]>([]);

    readonly hasChanges = computed(() => this._sources().some(source => source.hasChanges()));

    canDeactivate(): Observable<boolean> | boolean {
        const source = this._sources().find(current => current.hasChanges());

        if (!source) {
            return true;
        }

        return this.modalService.openConfirmation({
            cancelLabel: source.config.cancelLabel,
            confirmLabel: source.config.confirmLabel,
            message: source.config.message,
            title: source.config.title
        });
    }

    track(hasChanges: Signal<boolean>, config = new UnsavedChangesConfig()): void {
        const destroyReference = inject(DestroyRef);
        const source: UnsavedChangesSource = { config, hasChanges };
        const view = this.document.defaultView;
        const listener = (event: BeforeUnloadEvent): void => warnBeforeUnload(event, hasChanges);

        view?.addEventListener('beforeunload', listener);
        this._sources.update(sources => [...sources, source]);

        destroyReference.onDestroy(() => {
            view?.removeEventListener('beforeunload', listener);
            this._sources.update(sources => sources.filter(current => current !== source));
        });
    }
}

function warnBeforeUnload(event: BeforeUnloadEvent, hasChanges: Signal<boolean>): void {
    if (hasChanges()) {
        event.preventDefault();
    }
}
