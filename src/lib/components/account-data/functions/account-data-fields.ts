import { AccountDataField, AccountDataFieldKey } from '../models/account-data-field.model';

const FIELD_KEYS: ReadonlySet<string> = new Set(Object.values(AccountDataFieldKey));

export function assertAccountDataFields(fields: readonly Pick<AccountDataField, 'key'>[]): void {
    const listed = new Set<string>();

    for (const { key } of fields) {
        if (!FIELD_KEYS.has(key)) {
            throw new Error(`Unknown account data field: ${String(key)}`);
        }

        if (listed.has(key)) {
            throw new Error(`Account data field listed twice: ${key}`);
        }

        listed.add(key);
    }
}
