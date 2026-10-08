import { TestBed } from '@angular/core/testing';
import { BeyConfirmationModalConfig } from '@beyonda-labs/angular-components';
import { firstValueFrom } from 'rxjs';

import { FakeModalService } from './fake-modal.service';

describe('FakeModalService', () => {
    let modal: FakeModalService;

    function buildConfirmation(overrides: Partial<BeyConfirmationModalConfig> = {}): BeyConfirmationModalConfig {
        return { message: 'items.delete.message', title: 'items.delete.title', ...overrides };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [FakeModalService] });
        modal = TestBed.inject(FakeModalService);
    });

    it('records every notification it is asked to open, by kind', () => {
        modal.openError({ message: 'save.failed.message', title: 'save.failed.title' });
        modal.openInfo({ message: 'save.done.message', title: 'save.done.title' });
        modal.openWarning({
            message: 'save.stale.message',
            messageParameters: { minutes: 5 },
            title: 'save.stale.title'
        });

        expect(modal.errors()).toEqual([{ message: 'save.failed.message', title: 'save.failed.title' }]);
        expect(modal.infos()).toEqual([{ message: 'save.done.message', title: 'save.done.title' }]);
        expect(modal.warnings()).toEqual([
            { message: 'save.stale.message', messageParameters: { minutes: 5 }, title: 'save.stale.title' }
        ]);
    });

    it('records each confirmation and answers it with false until the spec sets the answer', async () => {
        const confirmation = buildConfirmation({ confirmLabel: 'items.delete.confirm' });

        await expect(firstValueFrom(modal.openConfirmation(confirmation))).resolves.toBe(false);
        expect(modal.confirmations()).toEqual([confirmation]);
    });

    it('answers the confirmations opened after the spec sets the answer with that answer', async () => {
        modal.setConfirmationAnswer(true);

        await expect(firstValueFrom(modal.openConfirmation(buildConfirmation()))).resolves.toBe(true);

        modal.setConfirmationAnswer(false);

        await expect(firstValueFrom(modal.openConfirmation(buildConfirmation()))).resolves.toBe(false);
    });

    it('returns a reference the caller can hide without a dialog behind it', () => {
        const reference = modal.openInfo({ message: 'save.done.message', title: 'save.done.title' });

        expect(() => reference.hide()).not.toThrow();
    });
});
