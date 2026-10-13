import { ComponentFixture, TestBed } from '@angular/core/testing';
import { hostOf, renderComponent } from '@testing/dom';

import { AvatarComponent } from './avatar.component';
import { AvatarConfig, AvatarConfigParameters, AvatarVariant } from './models/avatar.model';

describe('AvatarComponent', () => {
    let fixture: ComponentFixture<AvatarComponent>;

    function buildConfig(overrides: Partial<AvatarConfigParameters> = {}): AvatarConfig {
        return new AvatarConfig({ name: 'Ada', surname: 'Lovelace', ...overrides });
    }

    async function render(config: AvatarConfig = buildConfig()): Promise<HTMLElement> {
        fixture = await renderComponent(AvatarComponent, { config });

        return hostOf(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [AvatarComponent] }).compileComponents();
    });

    it('shows the initials of the name and the surname, hidden from assistive technology', async () => {
        const avatar = await render(buildConfig({ variant: AvatarVariant.Soft }));

        expect(avatar.textContent?.trim()).toBe('AL');
        expect(avatar.querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('AL');
    });

    it('shows the initials the config gives instead of those of the name', async () => {
        const avatar = await render(buildConfig({ initials: 'XY' }));

        expect(avatar.textContent?.trim()).toBe('XY');
    });
});
