import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { InternalModalConfig, ModalType } from '../models/modal.model';
import { ModalDialogComponent } from './modal-dialog.component';

const createConfig = (overrides?: Partial<InternalModalConfig>): InternalModalConfig => ({
    message: 'message',
    primaryActionLabel: 'primary',
    title: 'title',
    type: ModalType.Info,
    ...overrides
});

describe('ModalDialogComponent', () => {
    let component: ModalDialogComponent;
    let fixture: ComponentFixture<ModalDialogComponent>;

    const hide = jest.fn();

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
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = createConfig();

        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should show secondary action for confirmation modals', () => {
        component.config = createConfig({
            secondaryActionLabel: 'cancel',
            type: ModalType.Confirmation
        });

        expect(component.hasSecondaryAction()).toBe(true);
    });

    it('should NOT show secondary action for info modals', () => {
        component.config = createConfig({ type: ModalType.Info });

        expect(component.hasSecondaryAction()).toBe(false);
    });

    it('should emit true on primary action', () => {
        component.config = createConfig({ type: ModalType.Warning });
        const next = jest.fn();
        component.closed.subscribe(next);

        component.onPrimaryAction();

        expect(next).toHaveBeenCalledWith(true);
        expect(hide).toHaveBeenCalledTimes(1);
    });

    it('should emit false on dismiss for confirmation modals', () => {
        component.config = createConfig({
            secondaryActionLabel: 'cancel',
            type: ModalType.Confirmation
        });
        const next = jest.fn();
        component.closed.subscribe(next);

        component.dismiss();

        expect(next).toHaveBeenCalledWith(false);
        expect(hide).toHaveBeenCalledTimes(1);
    });
});