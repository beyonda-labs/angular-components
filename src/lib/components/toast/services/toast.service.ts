import { inject, Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';

import { ToastConfig, ToastConfigParameters, ToastType } from '../models/toast.model';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly ngZone = inject(NgZone);
    private readonly toastrService = inject(ToastrService);
    private readonly translateService = inject(TranslateService);

    showError(config: ToastConfigParameters): ActiveToast<unknown> {
        return this.show({ ...config, type: ToastType.Error });
    }

    showInfo(config: ToastConfigParameters): ActiveToast<unknown> {
        return this.show({ ...config, type: ToastType.Info });
    }

    showSuccess(config: ToastConfigParameters): ActiveToast<unknown> {
        return this.show({ ...config, type: ToastType.Success });
    }

    showWarning(config: ToastConfigParameters): ActiveToast<unknown> {
        return this.show({ ...config, type: ToastType.Warning });
    }

    private show(config: ToastConfigParameters): ActiveToast<unknown> {
        const parsedConfig = new ToastConfig(config);
        const { duration, type } = parsedConfig;
        const message = this.translateService.instant(parsedConfig.message);
        const title = this.translateService.instant(parsedConfig.title);

        let toast: ActiveToast<unknown>;

        switch (type) {
            case ToastType.Error:
                toast = this.toastrService.error(message, title);
                break;

            case ToastType.Warning:
                toast = this.toastrService.warning(message, title);
                break;

            case ToastType.Success:
                toast = this.toastrService.success(message, title);
                break;

            case ToastType.Info:
            default:
                toast = this.toastrService.info(message, title);
                break;
        }

        this.scheduleRemoval(toast.toastId, duration);

        return toast;
    }

    private scheduleRemoval(toastId: number, duration: number): void {
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.ngZone.run(() => this.toastrService.remove(toastId));
            }, duration);
        });
    }
}
