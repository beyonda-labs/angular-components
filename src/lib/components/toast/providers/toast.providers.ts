import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideToastr, ToastNoAnimation } from 'ngx-toastr';

export function provideBeyToast(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideToastr({
            closeButton: false,
            disableTimeOut: true,
            maxOpened: 5,
            newestOnTop: true,
            positionClass: 'toast-top-right',
            progressBar: false,
            tapToDismiss: false,
            toastClass: 'ngx-toastr bey-toast',
            toastComponent: ToastNoAnimation
        })
    ]);
}
