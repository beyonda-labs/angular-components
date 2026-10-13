import { fieldStateKey } from './field-state-key';

describe('field state key', () => {
    it('names a field by its section and its key, so two sections may hold fields of the same key', () => {
        expect(fieldStateKey('main', 'name')).toBe('main.name');
        expect(fieldStateKey('main', 'name')).not.toBe(fieldStateKey('extra', 'name'));
    });
});
