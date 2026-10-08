import { inject, Injectable } from '@angular/core';

import { StorageService } from '../../../services/session/storage.service';
import { toColumnChoices } from '../functions/table-columns';
import { TableColumnChoices } from '../models/table.model';

const STORAGE_PREFIX = 'bey-table-columns';

@Injectable({
    providedIn: 'root'
})
export class TableColumnsStorageService {
    private readonly storageService = inject(StorageService);

    load(storageKey?: string): TableColumnChoices {
        if (!storageKey) {
            return {};
        }

        try {
            return toColumnChoices(this.storageService.get<unknown>(toStorageKey(storageKey)));
        } catch {
            return {};
        }
    }

    remove(storageKey?: string): boolean {
        if (!storageKey) {
            return false;
        }

        try {
            this.storageService.remove(toStorageKey(storageKey));

            return true;
        } catch {
            return false;
        }
    }

    save(choices: TableColumnChoices, storageKey?: string): boolean {
        if (!storageKey) {
            return false;
        }

        try {
            this.storageService.set(toStorageKey(storageKey), choices);

            return true;
        } catch {
            return false;
        }
    }
}

function toStorageKey(storageKey: string): string {
    return `${STORAGE_PREFIX}.${storageKey}`;
}
