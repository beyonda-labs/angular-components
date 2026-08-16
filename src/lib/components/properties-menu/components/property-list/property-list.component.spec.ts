import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyGroup } from '../../models/property-group.model';
import { PropertyListContent } from '../../models/property-group-content.model';
import { PropertyListItem, PropertyListItemParameters } from '../../models/property-list-item.model';
import { PropertySummaryRow } from '../../models/property-summary-row.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyVariableService } from '../../services/property-variable.service';
import { PropertyListComponent } from './property-list.component';

describe('PropertyListComponent', () => {
    let component: PropertyListComponent;
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyVariableService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        component.tabId = 'add';
        component.groupId = 'simple-blocks';
        component.items = [
            new PropertyListItem({ id: 'block-heading', label: 'Encabezado' }),
            new PropertyListItem({ disabled: true, id: 'block-locked', label: 'Bloqueado' })
        ];
        fixture.detectChanges();
    });

    it('should render a card per item', () => {
        const labels: (string | undefined)[] = [...fixture.nativeElement.querySelectorAll('.bey-property-list-item-label')].map(
            (element: unknown) => (element as HTMLElement).textContent?.trim()
        );

        expect(labels).toEqual(['Encabezado', 'Bloqueado']);
    });

    it('should call PropertiesMenuService.selectListItem when a card is clicked', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        const card: HTMLElement = fixture.nativeElement.querySelector('.bey-list-item');

        card.click();

        expect(selectSpy).toHaveBeenCalledWith('add', 'simple-blocks', 'block-heading');
    });

    it('should not call PropertiesMenuService.selectListItem for a disabled item', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');
        const cards: HTMLElement[] = [...fixture.nativeElement.querySelectorAll('.bey-list-item')];

        cards[1].click();

        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('should apply the icon classes an item brings instead of the default colour', () => {
        component.items = [
            new PropertyListItem({ icon: faCircleExclamation, id: 'block-heading', iconClasses: 'bey-text-danger' })
        ];
        fixture.detectChanges();

        const icon: HTMLElement = fixture.nativeElement.querySelector('.bey-property-list-item-icon');

        expect(icon.classList.contains('bey-text-danger')).toBe(true);
        expect(icon.classList.contains('bey-property-list-item-icon-default')).toBe(false);
    });

    it('should fall back to the default icon colour when an item brings none', () => {
        component.items = [new PropertyListItem({ icon: faCircleExclamation, id: 'block-heading' })];
        fixture.detectChanges();

        const icon: HTMLElement = fixture.nativeElement.querySelector('.bey-property-list-item-icon');

        expect(icon.classList.contains('bey-property-list-item-icon-default')).toBe(true);
    });

    it('should resolve a default item label into a prefixed translation key', () => {
        propertiesMenuService.setConfig({ prefix: 'app.properties-menu' });

        expect(component.getLabelKey(new PropertyListItem({ id: 'block-heading' }))).toBe(
            'app.properties-menu.list.block-heading.label'
        );
    });
});

const buildItem = (overrides: Partial<PropertyListItemParameters> = {}): PropertyListItem =>
    new PropertyListItem({
        id: 'total_pages',
        label: 'total_pages',
        badges: [{ label: 'Número', cssClass: 'bey-badge-color-purple' }],
        body: [
            new PropertySummaryRow({ label: 'Valor por defecto' }),
            new PropertySummaryRow({ label: 'Valor', field: new PropertyTextField({ id: 'variable.v1.value', value: 'x' }) })
        ],
        ...overrides
    });

describe('PropertyListComponent con items desplegables', () => {
    let component: PropertyListComponent;
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const setUp = (items: PropertyListItem[]): void => {
        propertiesMenuService.setConfig({
            prefix: 'app.properties-menu',
            tabs: [
                new PropertyTab({
                    id: 'variables',
                    groups: [new PropertyGroup({ id: 'variables-list', content: new PropertyListContent({ list: items }) })]
                })
            ]
        });
        component.items = items;
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyVariableService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        component.tabId = 'variables';
        component.groupId = 'variables-list';
    });

    it('renders the badges an item brings', () => {
        setUp([buildItem()]);

        const badge: HTMLElement = fixture.nativeElement.querySelector('.bey-property-list-item-badges .bey-badge');

        expect(badge.textContent?.trim()).toBe('Número');
        expect(badge.classList.contains('bey-badge-color-purple')).toBe(true);
    });

    it('shows a chevron only on the items that carry a body', () => {
        setUp([buildItem(), new PropertyListItem({ id: 'plain' })]);

        expect(fixture.nativeElement.querySelectorAll('.bey-property-list-item-chevron').length).toBe(1);
    });

    it('keeps the body hidden until the item is expanded', () => {
        setUp([buildItem()]);

        expect(fixture.nativeElement.querySelector('.bey-property-list-item-body')).toBeFalsy();

        setUp([buildItem({ expanded: true })]);

        expect(fixture.nativeElement.querySelectorAll('.bey-property-summary-row').length).toBe(2);
    });

    it('toggles from the header, without selecting the card', () => {
        setUp([buildItem()]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        (fixture.nativeElement.querySelector('.bey-property-list-item') as HTMLElement).click();

        expect(toggleSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('does not collapse the card when a field in its body is clicked', () => {
        setUp([buildItem({ expanded: true })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const field: HTMLElement = fixture.nativeElement.querySelector('.bey-property-summary-row-field input');

        field.click();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not collapse the card when the body itself is clicked', () => {
        setUp([buildItem({ expanded: true })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');

        (fixture.nativeElement.querySelector('.bey-property-list-item-body') as HTMLElement).click();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('toggles when the chevron is clicked, without also selecting the row', () => {
        setUp([buildItem()]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        (fixture.nativeElement.querySelector('.bey-property-list-item-chevron') as HTMLElement).click();

        expect(toggleSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('still selects when the item has no body, so the problems tab keeps working', () => {
        setUp([new PropertyListItem({ id: 'problem-1' })]);

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectListItem');

        (fixture.nativeElement.querySelector('.bey-list-item') as HTMLElement).click();

        expect(selectSpy).toHaveBeenCalledWith('variables', 'variables-list', 'problem-1');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('renders a remove button only on removable items and does not toggle when it is used', () => {
        setUp([buildItem({ removable: true })]);

        const removeSpy = jest.spyOn(propertiesMenuService, 'removeListItem');
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleListItem');
        const remove: HTMLElement = fixture.nativeElement.querySelector('.bey-property-list-item-remove');

        remove.click();

        expect(removeSpy).toHaveBeenCalledWith('variables', 'variables-list', 'total_pages');
        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not render a remove button on a non-removable item', () => {
        setUp([buildItem()]);

        expect(fixture.nativeElement.querySelector('.bey-property-list-item-remove')).toBeFalsy();
    });

    it('renders a real field for an editable row and a dash for an empty one', () => {
        setUp([buildItem({ expanded: true })]);

        expect(fixture.nativeElement.querySelector('.bey-property-summary-row-field')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('.bey-property-summary-row-value').textContent?.trim()).toBe('—');
    });
});

describe('PropertyListComponent · etiquetas dentro del cuerpo', () => {
    let component: PropertyListComponent;
    let fixture: ComponentFixture<PropertyListComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyListComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyVariableService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyListComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        component.tabId = 'variables';
        component.groupId = 'variables-list';
    });

    it('lets the row own the label, so the field does not repeat it', () => {
        propertiesMenuService.setConfig({ prefix: 'app.properties-menu' });
        component.items = [
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
        ];
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-field-label')).toBeFalsy();
        expect(fixture.nativeElement.querySelector('.bey-property-summary-row-label').textContent.trim()).toBe('Valor');
    });
});
