import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';

import { ToastService } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    const mockActiveToast = { toastId: 1 } as ActiveToast<unknown>;

    const toastrService = {
        error: jest.fn().mockReturnValue(mockActiveToast),
        info: jest.fn().mockReturnValue(mockActiveToast),
        remove: jest.fn(),
        success: jest.fn().mockReturnValue(mockActiveToast),
        warning: jest.fn().mockReturnValue(mockActiveToast)
    };

    const translateService = {
        instant: jest.fn((key: string) => key)
    };

    beforeEach(() => {
        jest.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                ToastService,
                {
                    provide: ToastrService,
                    useValue: toastrService
                },
                {
                    provide: TranslateService,
                    useValue: translateService
                }
            ]
        });

        service = TestBed.inject(ToastService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should call toastr.success with provided title and message', () => {
        service.showSuccess({ message: 'Record saved', title: 'Dashboard' });

        expect(toastrService.success).toHaveBeenCalledWith('Record saved', 'Dashboard');
    });

    it('should call toastr.error with provided title and message', () => {
        service.showError({ message: 'Request failed', title: 'Settings' });

        expect(toastrService.error).toHaveBeenCalledWith('Request failed', 'Settings');
    });

    it('should call toastr.info with provided title and message', () => {
        service.showInfo({ message: 'Up to date', title: 'Sync' });

        expect(toastrService.info).toHaveBeenCalledWith('Up to date', 'Sync');
    });

    it('should call toastr.warning with provided title and message', () => {
        service.showWarning({ message: 'Unsaved changes', title: 'Editor' });

        expect(toastrService.warning).toHaveBeenCalledWith('Unsaved changes', 'Editor');
    });

    it('should remove toast after default duration', fakeAsync(() => {
        service.showInfo({ message: 'msg', title: 'page' });

        expect(toastrService.remove).not.toHaveBeenCalled();

        tick(3000);

        expect(toastrService.remove).toHaveBeenCalledWith(mockActiveToast.toastId);
    }));

    it('should remove toast after custom duration', fakeAsync(() => {
        service.showInfo({ message: 'msg', title: 'page', duration: 8000 });

        tick(2000);
        expect(toastrService.remove).not.toHaveBeenCalled();

        tick(6000);
        expect(toastrService.remove).toHaveBeenCalledWith(mockActiveToast.toastId);
    }));

    it('should return ActiveToast from toastr', () => {
        const result = service.showSuccess({ message: 'msg', title: 'page' });

        expect(result).toBe(mockActiveToast);
    });
});
