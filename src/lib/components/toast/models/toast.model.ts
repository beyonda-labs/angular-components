export enum ToastType {
    Error = 'error',
    Info = 'info',
    Success = 'success',
    Warning = 'warning'
}

export class ToastConfig {
    duration: number;
    message: string;
    title: string;
    type: ToastType;

    constructor({
        duration = 3000,
        message,
        type = ToastType.Info,
        title = `angular-components.toast.types.${type}`
    }: ToastConfigParameters) {
        this.duration = duration;
        this.message = message;
        this.title = title;
        this.type = type;
    }
}

export interface ToastConfigParameters {
    message: string;

    duration?: number;
    title?: string;
    type?: ToastType;
}
