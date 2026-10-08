import { config } from 'rxjs';

import { ignoreShownErrors, markAsShown } from './shown-errors';

describe('shown-errors', () => {
    let original: typeof config.onUnhandledError;

    function report(error: unknown): void {
        config.onUnhandledError?.(error);
    }

    beforeEach(() => {
        original = config.onUnhandledError;
        config.onUnhandledError = null;
    });

    afterEach(() => {
        config.onUnhandledError = original;
    });

    it('swallows an error marked as shown and throws any other one, as rxjs does by default', () => {
        const shown = markAsShown(new Error('shown'));
        ignoreShownErrors();

        expect(() => report(shown)).not.toThrow();
        expect(() => report(new Error('other'))).toThrow('other');
    });

    it('hands the errors it does not swallow to the handler installed before it', () => {
        const previous = jest.fn();
        const other = new Error('other');
        config.onUnhandledError = previous;
        ignoreShownErrors();

        report(markAsShown(new Error('shown')));
        report(other);

        expect(previous.mock.calls).toEqual([[other]]);
    });

    it('installs its handler once however many times it is called', () => {
        const previous = jest.fn();
        config.onUnhandledError = previous;
        ignoreShownErrors();
        const installed = config.onUnhandledError;

        ignoreShownErrors();
        report(new Error('other'));

        expect(config.onUnhandledError).toBe(installed);
        expect(previous).toHaveBeenCalledTimes(1);
    });

    it('returns what it marks and cannot mark a value that is not an object', () => {
        ignoreShownErrors();

        expect(markAsShown('failure')).toBe('failure');
        expect(() => report('failure')).toThrow('failure');
    });
});
