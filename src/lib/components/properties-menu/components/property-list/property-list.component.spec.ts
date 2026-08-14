import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyListComponent } from './property-list.component';

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
