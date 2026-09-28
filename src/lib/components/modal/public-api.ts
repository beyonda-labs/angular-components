export { unsavedChangesGuard as beyUnsavedChangesGuard } from './guards/unsaved-changes.guard';
export { ModalType as BeyModalType } from './models/modal.model';
export type {
    ConfirmationModalConfig as BeyConfirmationModalConfig,
    NotificationModalConfig as BeyNotificationModalConfig
} from './models/modal.model';
export { UnsavedChangesConfig as BeyUnsavedChangesConfig } from './models/unsaved-changes.model';
export type { UnsavedChangesConfigParameters as BeyUnsavedChangesConfigParameters } from './models/unsaved-changes.model';
export { provideBeyModal } from './providers/modal.providers';
export { ModalService as BeyModalService } from './services/modal.service';
export { UnsavedChangesService as BeyUnsavedChangesService } from './services/unsaved-changes.service';
