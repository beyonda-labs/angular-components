import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryButton, settle } from '@testing/dom';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { InternalModalConfig, ModalType } from '../models/modal.model';
import { ModalDialogComponent } from './modal-dialog.component';

const CLOSE_LABEL = 'angular-components.modal.actions.close';

const createConfig = (overrides?: Partial<InternalModalConfig>): InternalModalConfig => ({
    message: 'message',
    primaryActionLabel: 'primary',
    title: 'title',
    type: ModalType.Info,
    ...overrides
});

describe('ModalDialogComponent', () => {
    let fixture: ComponentFixture<ModalDialogComponent>;

    const hide = jest.fn();

    async function render(config: InternalModalConfig): Promise<void> {
        fixture.componentInstance.config = config;
        await settle(fixture);
    }

    function closedValues(): jest.Mock {
        const next = jest.fn();

        fixture.componentInstance.closed.subscribe(next);

        return next;
    }

    beforeEach(async () => {
        hide.mockReset();

        await TestBed.configureTestingModule({
            imports: [ModalDialogComponent, TranslateModule.forRoot()],
            providers: [
                {
                    provide: BsModalRef,
                    useValue: { hide }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ModalDialogComponent);
    });

    it('shows the type, the title and the message of the config', async () => {
        await render(createConfig({ message: 'demo.message', title: 'demo.title', type: ModalType.Error }));

        expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('demo.title');
        expect(fixture.nativeElement.textContent).toContain('angular-components.modal.types.error');
        expect(fixture.nativeElement.textContent).toContain('demo.message');
    });

    it('offers the secondary action on a confirmation modal', async () => {
        await render(createConfig({ secondaryActionLabel: 'cancel', type: ModalType.Confirmation }));

        expect(queryButton(fixture, 'cancel')).not.toBeNull();
    });

    it('does not offer the secondary action on an info modal', async () => {
        await render(createConfig({ secondaryActionLabel: 'cancel', type: ModalType.Info }));

        expect(queryButton(fixture, 'cancel')).toBeNull();
    });

    it('emits true and hides when the primary action is clicked', async () => {
        await render(createConfig({ type: ModalType.Warning }));
        const next = closedValues();

        buttonByName(fixture, 'primary').click();
        await settle(fixture);

        expect(next).toHaveBeenCalledWith(true);
        expect(hide).toHaveBeenCalledTimes(1);
    });

    it('emits false and hides when a confirmation modal is closed', async () => {
        await render(createConfig({ secondaryActionLabel: 'cancel', type: ModalType.Confirmation }));
        const next = closedValues();

        buttonByName(fixture, CLOSE_LABEL).click();
        await settle(fixture);

        expect(next).toHaveBeenCalledWith(false);
        expect(hide).toHaveBeenCalledTimes(1);
    });
});
