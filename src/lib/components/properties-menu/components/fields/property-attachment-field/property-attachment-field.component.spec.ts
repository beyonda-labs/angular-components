import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import {
    PropertyAttachmentField,
    PropertyAttachmentFieldParameters,
    PropertyAttachmentOption
} from '../../../models/fields/property-attachment-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertyAttachmentFieldComponent } from './property-attachment-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'source', labelId: null, labelKey: 'Source' };
const OPTIONS = [
    new PropertyAttachmentOption({ id: 'a1', label: 'Logo A4' }),
    new PropertyAttachmentOption({ id: 'a2', label: 'Imagen migrado 1' })
];
const VARIABLES = [new PropertyVariable({ id: 'v1', label: 'logo_cliente', path: 'logo_cliente' })];

describe('PropertyAttachmentFieldComponent', () => {
    let fixture: ComponentFixture<PropertyAttachmentFieldComponent>;
    let emitted: string[];
    let uploads: File[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyAttachmentFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.use('en');
    });

    async function render(parameters: Omit<PropertyAttachmentFieldParameters, 'id'> = {}): Promise<void> {
        emitted = [];
        uploads = [];
        fixture = await renderComponent(PropertyAttachmentFieldComponent, {
            field: new PropertyAttachmentField({ id: 'source', ...parameters }),
            labelling: LABELLING
        });
        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        fixture.componentInstance.uploadRequested.subscribe(file => uploads.push(file));
    }

    function control(name: string): HTMLInputElement {
        const [found] = queryAll<HTMLInputElement>(fixture, `[aria-label="${name}"]`);

        return found;
    }

    function options(): HTMLElement[] {
        return queryAll(fixture, '[role="option"]');
    }

    async function dispatch(event: Event, target: HTMLElement = control('Source')): Promise<void> {
        target.dispatchEvent(event);
        await settle(fixture);
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function choose(file: File): Promise<void> {
        const input = control('Upload a new file');

        Object.defineProperty(input, 'files', { configurable: true, value: [file] });
        await dispatch(new Event('change'), input);
    }

    function text(): string {
        return fixture.nativeElement.textContent ?? '';
    }

    it('renders a clear trigger only once an attachment is selected', async () => {
        await render({ options: OPTIONS, value: '' });

        expect(queryButton(fixture, 'Clear')).toBeNull();

        await render({ options: OPTIONS, value: 'a1' });

        expect(queryButton(fixture, 'Clear')).not.toBeNull();
    });

    it('filters the options by the typed query', async () => {
        await render({ options: OPTIONS });
        await dispatch(new Event('focus'));

        control('Source').value = 'migrado';
        await dispatch(new Event('input'));

        expect(textsOf(options())).toEqual(['Imagen migrado 1']);
    });

    it('emits the picked option and closes the panel', async () => {
        await render({ options: OPTIONS });
        await dispatch(new Event('focus'));

        await dispatch(
            new MouseEvent('mousedown'),
            options().find(option => option.textContent?.trim() === 'Imagen migrado 1') as HTMLElement
        );

        expect(emitted).toEqual(['a2']);
        expect(control('Source').getAttribute('aria-expanded')).toBe('false');
    });

    it('offers a variable button only when the field carries variables', async () => {
        await render({ options: OPTIONS });

        expect(queryButton(fixture, 'Use a variable')).toBeNull();

        await render({ variables: VARIABLES });

        expect(queryButton(fixture, 'Use a variable')).not.toBeNull();
    });

    it('emits the reference expression of the variable picked', async () => {
        await render({ variables: VARIABLES });

        await click(buttonByName(fixture, 'Use a variable'));
        await click(
            queryAll(document.body, '[role="option"]').find(option =>
                option.textContent?.includes('logo_cliente')
            ) as HTMLElement
        );

        expect(emitted).toEqual(['{{ logo_cliente }}']);
        expect(buttonByName(fixture, 'Use a variable').getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the attachment list when the variable picker opens', async () => {
        await render({ variables: VARIABLES });
        await dispatch(new Event('focus'));

        await click(buttonByName(fixture, 'Use a variable'));

        expect(buttonByName(fixture, 'Use a variable').getAttribute('aria-expanded')).toBe('true');
        expect(control('Source').getAttribute('aria-expanded')).toBe('false');
    });

    describe('picking a file to upload', () => {
        const WRONG_TYPE_TEXT = 'This file type is not accepted (image/*,application/pdf).';

        beforeEach(async () => {
            await render({ accept: 'image/*,application/pdf', maxSizeBytes: 1000 });
        });

        it('uploads a file of an accepted type', async () => {
            const logo = new File(['x'], 'logo.png', { type: 'image/png' });

            await choose(logo);

            expect(uploads).toEqual([logo]);
            expect(text()).not.toContain(WRONG_TYPE_TEXT);
        });

        it('rejects a file whose type is not accepted, without uploading it', async () => {
            await choose(new File(['x'], 'notes.txt', { type: 'text/plain' }));

            expect(uploads).toEqual([]);
            expect(text()).toContain(WRONG_TYPE_TEXT);
        });

        it('clears the type error once an accepted file is picked', async () => {
            await choose(new File(['x'], 'notes.txt', { type: 'text/plain' }));
            await choose(new File(['x'], 'logo.png', { type: 'image/png' }));

            expect(text()).not.toContain(WRONG_TYPE_TEXT);
        });

        it('rejects a file over the size limit', async () => {
            await choose(new File([new Uint8Array(2000)], 'big.png', { type: 'image/png' }));

            expect(uploads).toEqual([]);
            expect(text()).toContain('This file exceeds the 0 MB limit.');
        });
    });
});
