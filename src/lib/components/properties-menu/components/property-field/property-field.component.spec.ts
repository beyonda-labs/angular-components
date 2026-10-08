import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    accessibleName,
    buttonByName,
    controlByName,
    queryAll,
    queryControl,
    renderComponent,
    settle
} from '@testing/dom';

import propertiesMenuEn from '../../assets/properties-menu.en.json';
import { PropertyAttachmentField } from '../../models/fields/property-attachment-field.model';
import { PropertyColorField } from '../../models/fields/property-color-field.model';
import { PropertyFileField } from '../../models/fields/property-file-field.model';
import { PropertyNumberArrayField } from '../../models/fields/property-number-array-field.model';
import { PropertyNumberField } from '../../models/fields/property-number-field.model';
import { PropertySegmentedField } from '../../models/fields/property-segmented-field.model';
import { PropertySelectField } from '../../models/fields/property-select-field.model';
import { PropertySpacingField } from '../../models/fields/property-spacing-field.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyToggleField } from '../../models/fields/property-toggle-field.model';
import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyField } from '../../models/property-field.model';
import { PropertyOption } from '../../models/property-option.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyFieldComponent } from './property-field.component';

const APP_TRANSLATIONS = {
    app: {
        'properties-menu': {
            fields: {
                alignment: { label: 'Alignment' },
                background: { label: 'Background' },
                fill: { label: 'Fill' },
                font: { label: 'Font' },
                logo: { label: 'Logo' },
                notes: { label: 'Notes' },
                padding: { label: 'Padding' },
                'page-title': { label: 'Page title', 'action-button': { tooltip: 'Split' } },
                size: { label: 'Size' },
                title: { label: 'Title' },
                visible: { label: 'Visible' },
                widths: { label: 'Column widths' }
            }
        },
        rows: { value: 'Value' }
    }
};

const FONT_OPTIONS = [
    new PropertyOption({ label: 'Inter', value: 'inter' }),
    new PropertyOption({ label: 'Lora', value: 'lora' })
];

describe('PropertyFieldComponent', () => {
    let fixture: ComponentFixture<PropertyFieldComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.setTranslation('en', APP_TRANSLATIONS, true);
        translate.use('en');

        propertiesMenuService = TestBed.inject(PropertiesMenuService);
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
    });

    async function renderField(field: PropertyField, externalLabel?: string): Promise<void> {
        fixture = await renderComponent(PropertyFieldComponent, externalLabel ? { externalLabel, field } : { field });
    }

    function byId(id: string): HTMLElement {
        const found = document.querySelector<HTMLElement>(`[id="${id}"]`);

        if (!found) {
            throw new Error(`No element with id ${id}`);
        }

        return found;
    }

    function controlledBy(element: HTMLElement): HTMLElement {
        return byId(element.getAttribute('aria-controls') ?? '');
    }

    async function type(element: HTMLInputElement, value: string): Promise<void> {
        element.value = value;
        element.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    it('names a text input after the translated label it shows', async () => {
        await renderField(new PropertyTextField({ id: 'title', value: 'Invoice' }));

        expect(controlByName(fixture, 'Title').value).toBe('Invoice');
    });

    it('names a multiline text field after the translated label it shows', async () => {
        await renderField(new PropertyTextField({ id: 'notes', multiline: true, value: 'Paid' }));

        expect(controlByName<HTMLTextAreaElement>(fixture, 'Notes').value).toBe('Paid');
    });

    it('names a number input after the translated label it shows', async () => {
        await renderField(new PropertyNumberField({ id: 'size', value: 12 }));

        expect(controlByName(fixture, 'Size').value).toBe('12');
    });

    it('names a select after the translated label it shows', async () => {
        await renderField(new PropertySelectField({ id: 'font', options: FONT_OPTIONS, value: 'lora' }));

        expect(controlByName<HTMLSelectElement>(fixture, 'Font').value).toBe('lora');
    });

    it('names a searchable select and the option list it opens after the translated label', async () => {
        await renderField(
            new PropertySelectField({ id: 'font', options: FONT_OPTIONS, searchable: true, value: 'lora' })
        );
        const combobox = controlByName(fixture, 'Font');

        combobox.dispatchEvent(new Event('focus'));
        await settle(fixture);

        expect(accessibleName(controlledBy(combobox))).toBe('Font');
    });

    it('names a toggle after the label next to it and switches it when that label is clicked', async () => {
        const updateSpy = jest.spyOn(propertiesMenuService, 'updateFieldValue');

        await renderField(new PropertyToggleField({ id: 'visible', value: false }));
        const toggle = controlByName(fixture, 'Visible');

        queryAll(fixture, 'label')
            .find(label => label.textContent?.trim() === 'Visible')
            ?.click();

        expect(toggle.checked).toBe(true);
        expect(updateSpy).toHaveBeenCalledWith('visible', true);
    });

    it('names the colour picker after the label and its hex value after the label too', async () => {
        await renderField(new PropertyColorField({ id: 'fill', value: '#ff0000' }));

        expect(controlByName(fixture, 'Fill').type).toBe('color');
        expect(controlByName(fixture, 'Fill hex value').value).toBe('#ff0000');
    });

    it('names each entry of a number array and its remove button after the label and the position', async () => {
        await renderField(new PropertyNumberArrayField({ id: 'widths', value: [30, 70] }));

        expect(controlByName<HTMLElement>(fixture, 'Column widths').getAttribute('role')).toBe('group');
        expect(controlByName(fixture, 'Column widths, entry 2').value).toBe('70');
        expect(buttonByName(fixture, 'Remove Column widths, entry 2')).not.toBeNull();
    });

    it('names a segmented field after the label and each option after its own label', async () => {
        await renderField(
            new PropertySegmentedField({
                id: 'alignment',
                options: [
                    new PropertyOption({ label: 'Left', value: 'left' }),
                    new PropertyOption({ label: 'Right', value: 'right' })
                ],
                value: 'right'
            })
        );
        const group = controlByName<HTMLElement>(fixture, 'Alignment');

        expect(group.getAttribute('role')).toBe('radiogroup');
        expect(buttonByName(group, 'Right').getAttribute('aria-checked')).toBe('true');
    });

    it('names a spacing field after the label and each side after its own', async () => {
        await renderField(new PropertySpacingField({ id: 'padding', value: { bottom: 1, left: 2, right: 3, top: 4 } }));
        const group = controlByName<HTMLElement>(fixture, 'Padding');

        expect(group.getAttribute('role')).toBe('group');
        expect(controlByName(fixture, 'Top').value).toBe('4');
        expect(controlByName(fixture, 'Left').value).toBe('2');
    });

    it('names the file chooser after the label', async () => {
        await renderField(new PropertyFileField({ id: 'background' }));

        expect(buttonByName(fixture, 'Choose file for Background').textContent?.trim()).toBe('Choose file');
    });

    it('names the attachment picker after the label and gives the upload input its own name', async () => {
        await renderField(new PropertyAttachmentField({ id: 'logo' }));
        const combobox = controlByName(fixture, 'Logo');

        combobox.dispatchEvent(new Event('focus'));
        await settle(fixture);

        expect(combobox.getAttribute('role')).toBe('combobox');
        expect(accessibleName(controlledBy(combobox))).toBe('Logo');
        expect(controlByName(fixture, 'Upload a new file').type).toBe('file');
    });

    it('names the controls of a field after the label its container shows for it', async () => {
        await renderField(new PropertyTextField({ id: 'title', value: 'Invoice' }), 'app.rows.value');

        expect(controlByName(fixture, 'Value').value).toBe('Invoice');
        expect(fixture.nativeElement.textContent).not.toContain('Title');
    });

    it('keeps each label on its own control when two fields share an id', async () => {
        await renderField(new PropertyTextField({ id: 'title', value: 'First' }));
        const first = fixture;

        await renderField(new PropertyTextField({ id: 'title', value: 'Second' }));

        expect(controlByName(fixture, 'Title').value).toBe('Second');

        fixture = first;

        expect(controlByName(fixture, 'Title').value).toBe('First');
    });

    it('renders nothing for a hidden field', async () => {
        await renderField(new PropertyTextField({ id: 'title', hidden: true }));

        expect(queryControl(fixture, 'Title')).toBeNull();
        expect(fixture.nativeElement.textContent?.trim()).toBe('');
    });

    it('sends what is typed to the menu service', async () => {
        const updateSpy = jest.spyOn(propertiesMenuService, 'updateFieldValue');

        await renderField(new PropertyTextField({ id: 'title', value: 'Invoice' }));
        await type(controlByName(fixture, 'Title'), 'Receipt');

        expect(updateSpy).toHaveBeenCalledWith('title', 'Receipt');
    });

    it('keeps an explicit label key as it is', async () => {
        await renderField(new PropertyTextField({ id: 'subject', label: 'app.properties-menu.fields.title.label' }));

        expect(controlByName(fixture, 'Title')).not.toBeNull();
    });

    it('reads the label and action button texts of a camelCase field id from its kebab-case segment', async () => {
        await renderField(
            new PropertyTextField({ actionButton: { icon: faWandMagicSparkles }, id: 'pageTitle', value: 'Invoice' })
        );
        const input = controlByName(fixture, 'Page title');

        input.setSelectionRange(0, 3);
        input.dispatchEvent(new Event('select'));
        await settle(fixture);

        expect(buttonByName(fixture, 'Split')).not.toBeNull();
    });
});
