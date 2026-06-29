import { TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ReplaySubject, Subject } from 'rxjs';

import { ModalDialogComponent } from '../internal/modal-dialog.component';
import { ModalType } from '../models/modal.model';
import { ModalService } from './modal.service';

describe('ModalService', () => {
    let service: ModalService;

    const show = jest.fn();

    beforeEach(() => {
        show.mockReset();

        TestBed.configureTestingModule({
            providers: [
                ModalService,
                {
                    provide: BsModalService,
                    useValue: { show }
                }
            ]
        });

        service = TestBed.inject(ModalService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should open error modal with default close label', () => {
        show.mockReturnValue({} as BsModalRef<ModalDialogComponent>);

        service.openError({
            message: 'error.message',
            title: 'error.title'
        });

        expect(show).toHaveBeenCalledWith(
            ModalDialogComponent,
            expect.objectContaining({
                initialState: {
                    config: expect.objectContaining({
                        primaryActionLabel: ModalService.CLOSE_LABEL,
                        type: ModalType.Error
                    })
                }
            })
        );
    });

    it('should return confirmation observable from modal component', done => {
        const onHidden = new Subject<void>();
        show.mockReturnValue({
            content: {
                closed: new ReplaySubject<boolean>(1),
                result: true
            },
            onHidden
        } as BsModalRef<ModalDialogComponent>);

        service
            .openConfirmation({
                message: 'confirmation.message',
                title: 'confirmation.title'
            })
            .subscribe(value => {
                expect(value).toBe(true);
                done();
            });

        onHidden.next();
        onHidden.complete();
    });
});