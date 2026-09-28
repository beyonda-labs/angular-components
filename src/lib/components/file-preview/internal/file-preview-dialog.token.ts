import { InjectionToken } from '@angular/core';

import { FilePreviewConfig } from '../models/file-preview.model';

export const FILE_PREVIEW_CONFIG = new InjectionToken<FilePreviewConfig>('FILE_PREVIEW_CONFIG');

export const FILE_PREVIEW_TITLE_ID = 'bey-file-preview-title';
