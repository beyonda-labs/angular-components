import { FakeFormHandle } from './fake-form-handle';

interface Contact {
    email?: string;
    name: string;
}

describe('FakeFormHandle', () => {
    it('answers the value it was given, with what the spec patches merged in', () => {
        const handle = new FakeFormHandle<Contact>({ value: { name: 'Ada' } });

        handle.patchValue({ email: 'ada@example.test' });

        expect(handle.value()).toEqual({ email: 'ada@example.test', name: 'Ada' });
        expect(handle.patches()).toEqual([{ email: 'ada@example.test' }]);
    });

    it('is dirty unless the spec says otherwise', () => {
        expect(new FakeFormHandle().isDirty()).toBe(true);
        expect(new FakeFormHandle({ isDirty: false }).isDirty()).toBe(false);
    });

    it('records the closes, the close requests, the resets and the steps it is sent to', () => {
        const handle = new FakeFormHandle();

        handle.close();
        handle.requestClose();
        handle.requestClose();
        handle.reset();
        handle.goToStep('contact');

        expect([handle.closes(), handle.closeRequests(), handle.resets(), handle.steps()]).toEqual([
            1,
            2,
            1,
            ['contact']
        ]);
    });
});
