import {
    createEnvironmentInjector,
    EnvironmentInjector,
    runInInjectionContext,
    signal,
    WritableSignal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { Observable } from 'rxjs';

import { UnsavedChangesConfig } from '../models/unsaved-changes.model';
import { UnsavedChangesService } from './unsaved-changes.service';

describe('UnsavedChangesService', () => {
    let modal: FakeModalService;
    let service: UnsavedChangesService;

    function track(hasChanges: WritableSignal<boolean>, config?: UnsavedChangesConfig): void {
        TestBed.runInInjectionContext(() => service.track(hasChanges, config));
    }

    function unload(): Event {
        const event = new Event('beforeunload', { cancelable: true });

        window.dispatchEvent(event);

        return event;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        modal = TestBed.inject(FakeModalService);
        service = TestBed.inject(UnsavedChangesService);
    });

    it('lets the navigation through without asking when nothing tracked has changes', () => {
        track(signal(false));

        expect(service.canDeactivate()).toBe(true);
        expect(modal.confirmations()).toEqual([]);
    });

    it('asks with the library texts before leaving changes behind, and answers with the choice', () => {
        const answer = jest.fn();
        modal.setConfirmationAnswer(true);
        track(signal(true));

        (service.canDeactivate() as Observable<boolean>).subscribe(answer);

        expect(modal.confirmations()).toEqual([
            {
                cancelLabel: 'angular-components.modal.unsaved-changes.stay',
                confirmLabel: 'angular-components.modal.unsaved-changes.leave',
                message: 'angular-components.modal.unsaved-changes.message',
                title: 'angular-components.modal.unsaved-changes.title'
            }
        ]);
        expect(answer).toHaveBeenCalledWith(true);
    });

    it('asks with the texts of the source that has changes', () => {
        track(signal(false), new UnsavedChangesConfig({ title: 'other.title' }));
        track(signal(true), new UnsavedChangesConfig({ message: 'editor.message', title: 'editor.title' }));

        service.canDeactivate();

        expect(modal.confirmations()).toEqual([
            expect.objectContaining({ message: 'editor.message', title: 'editor.title' })
        ]);
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
