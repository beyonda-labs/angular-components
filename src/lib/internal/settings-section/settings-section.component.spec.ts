import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { accessibleName, queryAll, renderComponent } from '@testing/dom';

import { SettingsSectionComponent } from './settings-section.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SettingsSectionComponent],
    standalone: true,
    template: `
        <bey-settings-section descriptionKey="demo.profile.description" titleKey="demo.profile.title">
            <p>Projected form</p>
        </bey-settings-section>
        <bey-settings-section titleKey="demo.password.title"></bey-settings-section>
    `
})
class SettingsSectionHostComponent {}

describe('SettingsSectionComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SettingsSectionHostComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('names each section after its title, with its description over what it holds', async () => {
        const fixture = await renderComponent(SettingsSectionHostComponent);
        const [profile, password] = queryAll(fixture, 'section');

        expect(accessibleName(profile)).toBe('demo.profile.title');
        expect(profile.textContent).toContain('demo.profile.description');
        expect(profile.textContent).toContain('Projected form');
        expect(accessibleName(password)).toBe('demo.password.title');
        expect(password.textContent).not.toContain('description');
    });
});
