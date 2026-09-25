import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertiesMenuHeaderConfig } from '../../models/properties-menu-header.model';
import { PropertiesMenuHeaderComponent } from './properties-menu-header.component';

describe('PropertiesMenuHeaderComponent', () => {
    let fixture: ComponentFixture<PropertiesMenuHeaderComponent>;
    let element: HTMLElement;

    function render(config: PropertiesMenuHeaderConfig): void {
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuHeaderComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertiesMenuHeaderComponent);
        element = fixture.nativeElement;
    });

    it('should render the title, subtitle and icon', () => {
        render(new PropertiesMenuHeaderConfig({ icon: faFont, subtitle: 'Block', title: 'Properties' }));

        expect(element.querySelector('.bey-properties-menu-header-title')?.textContent).toContain('Properties');
        expect(element.querySelector('.bey-properties-menu-header-subtitle')?.textContent).toContain('Block');
        expect(element.querySelector('.bey-properties-menu-header-icon fa-icon')).not.toBeNull();
    });

    it('should omit the subtitle and the icon when not configured', () => {
        render(new PropertiesMenuHeaderConfig({ title: 'Properties' }));

        expect(element.querySelector('.bey-properties-menu-header-subtitle')).toBeNull();
        expect(element.querySelector('.bey-properties-menu-header-icon fa-icon')).toBeNull();
    });

    it('should render the close button only with onClose and call it on click', () => {
        const onClose = jest.fn();

        render(new PropertiesMenuHeaderConfig({ title: 'Properties' }));
        expect(element.querySelector('.bey-properties-menu-header-close')).toBeNull();

        render(new PropertiesMenuHeaderConfig({ onClose, title: 'Properties' }));
        element.querySelector<HTMLButtonElement>('.bey-properties-menu-header-close')?.click();

        expect(onClose).toHaveBeenCalled();
    });
});
