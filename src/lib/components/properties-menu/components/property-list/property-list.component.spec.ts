import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    [...fixture.nativeElement.querySelectorAll('[role="button"]')].filter(
        element => !element.parentElement?.closest('[role="button"]')
    );

const button = (fixture: ComponentFixture<PropertyListComponent>, name: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(`[aria-label="${name}"]`);

const byText = (fixture: ComponentFixture<PropertyListComponent>, text: string): HTMLElement => {
    const found = [...fixture.nativeElement.querySelectorAll('*')].findLast(
        element => element.textContent?.trim() === text
    );

    if (!found) {
        throw new Error(`No element with text ${text}`);
    }

    return found;
};

const EXPAND = 'angular-components.properties-menu.list.expand';
const REMOVE = 'angular-components.properties-menu.remove';
const COPY = 'angular-components.properties-menu.list.copy';

describe('PropertyListComponent', () => {
    let component: PropertyListComponent;
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture.componentRef.setInput('tabId', 'add');
        fixture.componentRef.setInput('groupId', 'simple-blocks');
        fixture.componentRef.setInput('items', [
            new PropertyListItem({ id: 'block-heading', label: 'Encabezado' }),
            new PropertyListItem({ disabled: true, id: 'block-locked', label: 'Bloqueado' })
        ]);
        fixture.detectChanges();
    });

    it('should render a card per item', () => {
        expect(items(fixture).map(element => element.textContent?.trim())).toEqual(['Encabezado', 'Bloqueado']);
    });

    it('should call PropertiesMenuService.selectListItem when a card is clicked', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        items(fixture)[0].click();

        expect(selectSpy).toHaveBeenCalledWith('add', 'simple-blocks', 'block-heading');
    });

    it('should not call PropertiesMenuService.selectListItem for a disabled item', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        items(fixture)[1].click();

        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('should resolve a default item label into a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));

        expect(component.labelKey(new PropertyListItem({ id: 'block-heading' }))).toBe(
            'app.properties-menu.list.block-heading.label'
        );
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

        expect(fixture.nativeElement.querySelector('bey-badge').textContent?.trim()).toBe('Número');
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
        expect(fixture.nativeElement.querySelector('input').value).toBe('x');
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
        fixture.nativeElement.querySelector('input').click();

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

        button(fixture, EXPAND)?.click();

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
        button(fixture, REMOVE)?.click();

        expect(removeSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not render a remove button on a non-removable item', () => {
        setUp([buildItem()]);

        expect(button(fixture, REMOVE)).toBeNull();
    });

    it('renders a real field for an editable row and a dash for an empty one', () => {
        setUp([buildItem({ expanded: true })]);

        expect(fixture.nativeElement.querySelector('input').value).toBe('x');
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

    it('lets the row own the label, so the field does not repeat it', () => {
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

        expect(fixture.nativeElement.querySelector('label')).toBeNull();
        expect(byText(fixture, 'Valor')).toBeTruthy();
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
    let component: PropertyListComponent;
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
        component = fixture.componentInstance;
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

    it('shows one button per action plus the copy one', () => {
        expect(button(fixture, COPY)).toBeTruthy();
        expect(button(fixture, 'Duplicar')).toBeTruthy();
    });

    it('copies the expression the item carries, not its label', async () => {
        await component.onCopy(new MouseEvent('click'), component.items()[0]);

        expect(written).toEqual(['{{ total }}']);
    });

    it('marks the item as copied so the button can confirm it', async () => {
        await component.onCopy(new MouseEvent('click'), component.items()[0]);

        expect(component.copiedItemId()).toBe('v1');
        expect(component.copyLabelKey(component.items()[0])).toBe('angular-components.properties-menu.list.copied');
    });

    it('does not leave the copied state on when the clipboard refuses', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: () => Promise.reject(new Error('denied')) }
        });

        await component.onCopy(new MouseEvent('click'), component.items()[0]);

        expect(component.copiedItemId()).toBeNull();
    });

    it('reports the action key without selecting or toggling the card', () => {
        const actionSpy = jest.spyOn(propertiesMenuService, 'triggerListItemAction');
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        button(fixture, 'Duplicar')?.click();

        expect(actionSpy).toHaveBeenCalledWith('variables', 'variables-list', 'v1', 'duplicate');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('renders no copy button when the item carries nothing to copy', () => {
        fixture.componentRef.setInput('items', [new PropertyListItem({ id: 'v2', label: 'otra' })]);
        fixture.detectChanges();

        expect(button(fixture, COPY)).toBeNull();
        expect(button(fixture, 'Duplicar')).toBeNull();
    });
});
