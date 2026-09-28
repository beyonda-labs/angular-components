import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton } from '@testing/dom';

import { PropertiesMenuHeaderConfig } from '../../models/properties-menu-header.model';
import { PropertiesMenuHeaderComponent } from './properties-menu-header.component';

describe('PropertiesMenuHeaderComponent', () => {
    let fixture: ComponentFixture<PropertiesMenuHeaderComponent>;
    let element: HTMLElement;

    function render(config: PropertiesMenuHeaderConfig): void {
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
    }

    function closeButton(): HTMLButtonElement | null {
        return queryButton(element, 'angular-components.properties-menu.close');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuHeaderComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertiesMenuHeaderComponent);
        element = fixture.nativeElement;
    });

    it('renders the title and the subtitle', () => {
        render(new PropertiesMenuHeaderConfig({ icon: faFont, subtitle: 'Block', title: 'Properties' }));

        expect(element.textContent).toContain('Properties');
        expect(element.textContent).toContain('Block');
    });

    it('omits the subtitle when not configured', () => {
        render(new PropertiesMenuHeaderConfig({ title: 'Properties' }));

        expect(element.textContent).not.toContain('Block');
    });

    it('renders the close button only with onClose and calls it on click', () => {
        const onClose = jest.fn();

        render(new PropertiesMenuHeaderConfig({ title: 'Properties' }));
        expect(closeButton()).toBeNull();

        render(new PropertiesMenuHeaderConfig({ onClose, title: 'Properties' }));
        closeButton()?.click();

        expect(onClose).toHaveBeenCalled();
    });
});
