import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, textsOf } from '@testing/dom';

import { BadgeConfig, BadgeVariant } from '../../../badge/models/badge.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyGroup } from '../../models/property-group.model';
import { PropertyListContent } from '../../models/property-group-content.model';
import {
    PropertyListItem,
    PropertyListItemAction,
    PropertyListItemParameters
} from '../../models/property-list-item.model';
import { PropertySummaryRow } from '../../models/property-summary-row.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyListComponent } from './property-list.component';

const items = (fixture: ComponentFixture<PropertyListComponent>): HTMLElement[] =>
    queryAll(fixture, '[role="button"]').filter(element => !element.parentElement?.closest('[role="button"]'));

const byText = (fixture: ComponentFixture<PropertyListComponent>, text: string): HTMLElement => {
    const found = queryAll(fixture, '*')
        .reverse()
        .find(element => element.textContent?.trim() === text);

    if (!found) {
        throw new Error(`No element with text ${text}`);
    }

    return found;
};

const rowField = (fixture: ComponentFixture<PropertyListComponent>, name: string): HTMLInputElement => {
    const [found] = queryAll<HTMLInputElement>(fixture, `input[aria-label="${name}"]`);

    if (!found) {
        throw new Error(`No field named ${name}`);
    }

    return found;
};

const COPIED = 'angular-components.properties-menu.list.copied';
const EXPAND = 'angular-components.properties-menu.list.expand';
const REMOVE = 'angular-components.properties-menu.remove';
const COPY = 'angular-components.properties-menu.list.copy';

describe('PropertyListComponent', () => {
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture = await renderComponent(PropertyListComponent, {
            tabId: 'add',
            groupId: 'simple-blocks',
            items: [
                new PropertyListItem({ id: 'block-heading', label: 'Encabezado' }),
                new PropertyListItem({ disabled: true, id: 'block-locked', label: 'Bloqueado' })
            ]
        });
    });

    it('renders a card per item', () => {
        expect(textsOf(items(fixture))).toEqual(['Encabezado', 'Bloqueado']);
    });

    it('selects the item through the menu service when its card is clicked', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        items(fixture)[0].click();

        expect(selectSpy).toHaveBeenCalledWith('add', 'simple-blocks', 'block-heading');
    });

    it('does not select a disabled item', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        items(fixture)[1].click();

        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('shows the default label of an item as a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        fixture.componentRef.setInput('items', [new PropertyListItem({ id: 'block-heading' })]);
        fixture.detectChanges();

        expect(textsOf(items(fixture))).toEqual(['app.properties-menu.list.block-heading.label']);
    });
});

const buildItem = (overrides: Partial<PropertyListItemParameters> = {}): PropertyListItem =>
    new PropertyListItem({
        id: 'total_pages',
        label: 'total_pages',
        badges: [new BadgeConfig({ label: 'Número', variant: BadgeVariant.Purple })],
        body: [
            new PropertySummaryRow({ label: 'Valor por defecto' }),
            new PropertySummaryRow({
                label: 'Valor',
                field: new PropertyTextField({ id: 'variable.v1.value', value: 'x' })
            })
        ],
        ...overrides
    });

describe('PropertyListComponent with expandable items', () => {
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const setUp = (items: PropertyListItem[]): void => {
        propertiesMenuService.setConfig(
            new PropertiesMenuConfig({
                prefix: 'app.properties-menu',
                tabs: [
                    new PropertyTab({
                        id: 'variables',
                        groups: [
                            new PropertyGroup({
                                id: 'variables-list',
                                content: new PropertyListContent({ list: items })
                            })
                        ]
                    })
                ]
            })
        );
        fixture.componentRef.setInput('items', items);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture.componentRef.setInput('tabId', 'variables');
        fixture.componentRef.setInput('groupId', 'variables-list');
    });

    it('renders the badges an item brings', () => {
        setUp([buildItem()]);

        expect(items(fixture)[0].textContent).toContain('Número');
    });

    it('shows a chevron only on the items that carry a body', () => {
        setUp([buildItem(), new PropertyListItem({ id: 'plain' })]);

        expect(fixture.nativeElement.querySelectorAll(`[aria-label="${EXPAND}"]`).length).toBe(1);
    });

    it('keeps the body hidden until the item is expanded', () => {
        setUp([buildItem()]);

        expect(fixture.nativeElement.textContent).not.toContain('Valor por defecto');

        setUp([buildItem({ expanded: true })]);

        expect(fixture.nativeElement.textContent).toContain('Valor por defecto');
        expect(rowField(fixture, 'Valor').value).toBe('x');
    });

    it('toggles from the header, without selecting the card', () => {
        setUp([buildItem()]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        byText(fixture, 'total_pages').click();

        expect(toggleSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('does not collapse the card when a field in its body is clicked', () => {
        setUp([buildItem({ expanded: true })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        rowField(fixture, 'Valor').click();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not collapse the card when the body itself is clicked', () => {
        setUp([buildItem({ expanded: true })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');

        byText(fixture, 'Valor por defecto').click();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('toggles when the chevron is clicked, without also selecting the row', () => {
        setUp([buildItem()]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        queryButton(fixture, EXPAND)?.click();

        expect(toggleSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('still selects when the item has no body, so the problems tab keeps working', () => {
        setUp([new PropertyListItem({ id: 'problem-1' })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        items(fixture)[0].click();

        expect(selectSpy).toHaveBeenCalledWith('variables', 'variables-list', 'problem-1');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('renders a remove button only on removable items and does not toggle when it is used', () => {
        setUp([buildItem({ removable: true })]);

        const removeSpy = jest.spyOn(propertiesMenuService, 'removeListItem');
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        queryButton(fixture, REMOVE)?.click();

        expect(removeSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not render a remove button on a non-removable item', () => {
        setUp([buildItem()]);

        expect(queryButton(fixture, REMOVE)).toBeNull();
    });

    it('renders a real field for an editable row and a dash for an empty one', () => {
        setUp([buildItem({ expanded: true })]);

        expect(rowField(fixture, 'Valor').value).toBe('x');
        expect(fixture.nativeElement.textContent).toContain('—');
    });
});

describe('PropertyListComponent body labels', () => {
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture.componentRef.setInput('tabId', 'variables');
        fixture.componentRef.setInput('groupId', 'variables-list');
    });

    it('names the field of a row after the row label, without a label of its own', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        fixture.componentRef.setInput('items', [
            new PropertyListItem({
                id: 'v1',
                expanded: true,
                body: [
                    new PropertySummaryRow({
                        label: 'Valor',
                        field: new PropertyTextField({ id: 'variable.v1.value', value: 'x' })
                    })
                ]
            })
        ]);
        fixture.detectChanges();

        expect(rowField(fixture, 'Valor').value).toBe('x');
        expect(fixture.nativeElement.textContent).not.toContain('app.properties-menu.fields.variable.v1.value.label');
    });
});

describe('PropertyListComponent label parameters', () => {
    let fixture: ComponentFixture<PropertyListComponent>;
    let translate: TranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        translate = TestBed.inject(TranslateService);
        translate.setTranslation('es', { problems: { wrongType: 'Es {{actual}} y se espera {{expected}}' } });
        translate.use('es');

        fixture.componentRef.setInput('tabId', 'problems');
        fixture.componentRef.setInput('groupId', 'problems-list');
    });

    it('interpolates the parameters a list item carries', () => {
        fixture.componentRef.setInput('items', [
            new PropertyListItem({
                id: 'p1',
                label: 'problems.wrongType',
                labelParameters: { actual: 'pdf', expected: 'image' }
            })
        ]);
        fixture.detectChanges();

        expect(items(fixture)[0].textContent?.trim()).toBe('Es pdf y se espera image');
    });

    it('still renders a label that takes no parameters', () => {
        translate.setTranslation('es', { problems: { plain: 'Sin parámetros' } }, true);
        fixture.componentRef.setInput('items', [new PropertyListItem({ id: 'p2', label: 'problems.plain' })]);
        fixture.detectChanges();

        expect(items(fixture)[0].textContent?.trim()).toBe('Sin parámetros');
    });
});

describe('PropertyListComponent copy and actions', () => {
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;
    let written: string[];

    beforeEach(async () => {
        written = [];
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: (text: string) => {
                    written.push(text);

                    return Promise.resolve();
                }
            }
        });

        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        propertiesMenuService = TestBed.inject(PropertiesMenuService);
        propertiesMenuService.setConfig(
            new PropertiesMenuConfig({
                prefix: 'app.properties-menu',
                tabs: [
                    new PropertyTab({
                        id: 'variables',
                        groups: [
                            new PropertyGroup({
                                id: 'variables-list',
                                content: new PropertyListContent({
                                    list: [
                                        new PropertyListItem({
                                            id: 'v1',
                                            label: 'total',
                                            copyValue: '{{ total }}',
                                            actions: [
                                                new PropertyListItemAction({
                                                    icon: faCircleExclamation,
                                                    key: 'duplicate',
                                                    label: 'Duplicar'
                                                })
                                            ]
                                        })
                                    ]
                                })
                            })
                        ]
                    })
                ]
            })
        );

        fixture.componentRef.setInput('tabId', 'variables');
        fixture.componentRef.setInput('groupId', 'variables-list');
        fixture.componentRef.setInput('items', [
            new PropertyListItem({
                id: 'v1',
                label: 'total',
                copyValue: '{{ total }}',
                actions: [
                    new PropertyListItemAction({ icon: faCircleExclamation, key: 'duplicate', label: 'Duplicar' })
                ]
            })
        ]);
        fixture.detectChanges();
    });

    async function copy(): Promise<void> {
        queryButton(fixture, COPY)?.click();
        await new Promise(resolve => {
            setTimeout(resolve);
        });
        fixture.detectChanges();
    }

    it('shows one button per action plus the copy one', () => {
        expect(queryButton(fixture, COPY)).toBeTruthy();
        expect(queryButton(fixture, 'Duplicar')).toBeTruthy();
    });

    it('copies the expression the item carries, not its label', async () => {
        await copy();

        expect(written).toEqual(['{{ total }}']);
    });

    it('renames the copy button to confirm the copy', async () => {
        await copy();

        expect(queryButton(fixture, COPIED)).not.toBeNull();
        expect(queryButton(fixture, COPY)).toBeNull();
    });

    it('does not leave the copied state on when the clipboard refuses', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: () =>
                    new Promise((_resolve, reject) => {
                        setTimeout(() => reject(new Error('denied')));
                    })
            }
        });

        await copy();

        expect(queryButton(fixture, COPIED)).toBeNull();
    });

    it('reports the action key without selecting or toggling the card', () => {
        const actionSpy = jest.spyOn(propertiesMenuService, 'triggerListItemAction');
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        queryButton(fixture, 'Duplicar')?.click();

        expect(actionSpy).toHaveBeenCalledWith('variables', 'variables-list', 'v1', 'duplicate');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('renders no copy button when the item carries nothing to copy', () => {
        fixture.componentRef.setInput('items', [new PropertyListItem({ id: 'v2', label: 'otra' })]);
        fixture.detectChanges();

        expect(queryButton(fixture, COPY)).toBeNull();
        expect(queryButton(fixture, 'Duplicar')).toBeNull();
    });
});
