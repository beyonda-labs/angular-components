import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, settle } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import { PropertyFileField, PropertyFileFieldParameters } from '../../../models/fields/property-file-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyFileFieldComponent } from './property-file-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'source', labelId: null, labelKey: 'Source' };
const TOO_LARGE_TEXT = 'This file exceeds the 0 MB limit.';

describe('PropertyFileFieldComponent', () => {
    let fixture: ComponentFixture<PropertyFileFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFileFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.use('en');
    });

    async function render(parameters: Omit<PropertyFileFieldParameters, 'id'> = {}): Promise<void> {
        fixture = await renderComponent(PropertyFileFieldComponent, {
            field: new PropertyFileField({ id: 'source', ...parameters }),
            labelling: LABELLING
        });
    }

    async function choose(name: string, bytes: number[]): Promise<void> {
        const [input] = queryAll<HTMLInputElement>(fixture, 'input[type="file"]');
        const file = new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });

        Object.defineProperty(input, 'files', { configurable: true, value: [file] });
        input.dispatchEvent(new Event('change'));
        await settle(fixture);
    }

    function nextValue(): Promise<string> {
        return new Promise(resolve => {
            fixture.componentInstance.valueChange.subscribe(resolve);
        });
    }

    function text(): string {
        return fixture.nativeElement.textContent ?? '';
    }

    it('names the chooser after the field and shows that nothing is chosen', async () => {
        await render({ value: '' });

        expect(queryButton(fixture, 'Choose file for Source')).not.toBeNull();
        expect(text()).toContain('No file selected');
        expect(queryButton(fixture, 'Clear')).toBeNull();
    });

    it('shows a clear button once a value is set', async () => {
        await render({ value: 'AAAA' });

        expect(text()).toContain('File selected');
        expect(queryButton(fixture, 'Clear')).not.toBeNull();
    });

    it('emits an empty string when the clear button is clicked', async () => {
        await render({ value: 'AAAA' });
        const emitted: string[] = [];

        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        queryButton(fixture, 'Clear')?.click();

        expect(emitted).toEqual(['']);
    });

    it('reads the chosen file as base64, emits it without the data URI prefix and shows its name', async () => {
        await render({ accept: 'application/pdf', value: '' });
        const value = nextValue();

        await choose('sample.pdf', [1, 2, 3]);

        expect(await value).toBe('AQID');
        expect(text()).toContain('sample.pdf');
    });

    it('rejects a file larger than maxSizeBytes without reading or emitting it', async () => {
        await render({ maxSizeBytes: 2, value: '' });
        const emitted: string[] = [];

        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        await choose('too-big.pdf', [1, 2, 3]);

        expect(emitted).toEqual([]);
        expect(text()).toContain(TOO_LARGE_TEXT);
        expect(text()).not.toContain('too-big.pdf');
    });

    it('accepts a file at or under maxSizeBytes', async () => {
        await render({ maxSizeBytes: 10, value: '' });
        const value = nextValue();

        await choose('sample.pdf', [1, 2, 3]);

        expect(await value).toBe('AQID');
        expect(text()).not.toContain(TOO_LARGE_TEXT);
    });

    it('clears the size error once a valid file is picked', async () => {
        await render({ maxSizeBytes: 2, value: '' });
        await choose('too-big.pdf', [1, 2, 3]);

        expect(text()).toContain(TOO_LARGE_TEXT);

        await choose('ok.pdf', [1, 2]);

        expect(text()).not.toContain(TOO_LARGE_TEXT);
    });
});
