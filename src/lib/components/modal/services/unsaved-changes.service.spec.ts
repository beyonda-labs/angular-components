import {
    createEnvironmentInjector,
    EnvironmentInjector,
    runInInjectionContext,
    signal,
    WritableSignal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { UnsavedChangesConfig } from '../models/unsaved-changes.model';
import { ModalService } from './modal.service';
import { UnsavedChangesService } from './unsaved-changes.service';

describe('UnsavedChangesService', () => {
    let service: UnsavedChangesService;

    const openConfirmation = jest.fn();

    function track(hasChanges: WritableSignal<boolean>, config?: UnsavedChangesConfig): void {
        TestBed.runInInjectionContext(() => service.track(hasChanges, config));
    }

    function unload(): Event {
        const event = new Event('beforeunload', { cancelable: true });

        window.dispatchEvent(event);

        return event;
    }

    beforeEach(() => {
        openConfirmation.mockReset();
        openConfirmation.mockReturnValue(of(true));

        TestBed.configureTestingModule({
            providers: [{ provide: ModalService, useValue: { openConfirmation } }]
        });

        service = TestBed.inject(UnsavedChangesService);
    });

    it('lets the navigation through without asking when nothing tracked has changes', () => {
        track(signal(false));

        expect(service.canDeactivate()).toBe(true);
        expect(openConfirmation).not.toHaveBeenCalled();
    });

    it('asks with the library texts before leaving changes behind, and answers with the choice', () => {
        const answer = jest.fn();
        track(signal(true));

        (service.canDeactivate() as Observable<boolean>).subscribe(answer);

        expect(openConfirmation).toHaveBeenCalledWith({
            cancelLabel: 'angular-components.modal.unsaved-changes.stay',
            confirmLabel: 'angular-components.modal.unsaved-changes.leave',
            message: 'angular-components.modal.unsaved-changes.message',
            title: 'angular-components.modal.unsaved-changes.title'
        });
        expect(answer).toHaveBeenCalledWith(true);
    });

    it('asks with the texts of the source that has changes', () => {
        track(signal(false), new UnsavedChangesConfig({ title: 'other.title' }));
        track(signal(true), new UnsavedChangesConfig({ message: 'editor.message', title: 'editor.title' }));

        service.canDeactivate();

        expect(openConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'editor.message', title: 'editor.title' })
        );
    });

    it('follows the tracked signals in hasChanges', () => {
        const hasChanges = signal(false);
        track(hasChanges);

        expect(service.hasChanges()).toBe(false);

        hasChanges.set(true);

        expect(service.hasChanges()).toBe(true);
    });

    it('warns before the page unloads only while there are changes', () => {
        const hasChanges = signal(false);
        track(hasChanges);

        expect(unload().defaultPrevented).toBe(false);

        hasChanges.set(true);

        expect(unload().defaultPrevented).toBe(true);
    });

    it('forgets a source once its owner is destroyed', () => {
        const owner = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
        runInInjectionContext(owner, () => service.track(signal(true)));

        owner.destroy();

        expect(service.canDeactivate()).toBe(true);
        expect(unload().defaultPrevented).toBe(false);
    });
});
