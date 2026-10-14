import { ButtonType } from '../../../internal/button/models/button-config.model';
import { noop, submitType } from './form-buttons';

describe('form-buttons', () => {
    it('paints a danger submit button in the danger colour and any other in the primary one', () => {
        expect(submitType({ isDanger: true })).toBe(ButtonType.Danger);
        expect(submitType({ isDanger: false })).toBe(ButtonType.Primary);
    });

    it('gives a button without an action one that does nothing', () => {
        expect(noop()).toBeUndefined();
    });
});
