import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import {
    NoticeAction,
    NoticeActionType,
    NoticeConfig,
    NoticeConfigParameters,
    NoticeVariant
} from './models/notice.model';
import { NoticeComponent } from './notice.component';

describe('NoticeComponent', () => {
    let fixture: ComponentFixture<NoticeComponent>;

    function buildConfig(overrides: Partial<NoticeConfigParameters> = {}): NoticeConfig {
        return new NoticeConfig({ message: 'demo.message', ...overrides });
    }

    async function render(config: NoticeConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(NoticeComponent, { config });
    }

    function notice(): HTMLElement {
        const [found] = queryAll(fixture, '[role="status"], [role="alert"]');

        if (!found) {
            throw new Error('No notice');
        }

        return found;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoticeComponent],
            providers: [
                provideBeyTesting({
                    translations: {
                        en: { demo: { edit: 'Edit', message: 'Ada is editing it since {{time}}.', release: 'Release' } }
                    }
                })
            ]
        });
    });

    it('shows the translated message with its parameters', async () => {
        await render(buildConfig({ messageParameters: { time: '10:42' } }));

        expect(notice().textContent?.trim()).toBe('Ada is editing it since 10:42.');
    });

    it('is announced politely for information and warnings, and as an alert for danger', async () => {
        await render(buildConfig({ variant: NoticeVariant.Warning }));
        expect(notice().getAttribute('role')).toBe('status');

        await render(buildConfig({ variant: NoticeVariant.Danger }));
        expect(notice().getAttribute('role')).toBe('alert');
    });

    it('offers no button without actions, and one per action in order otherwise', async () => {
        await render();
        expect(queryAll(fixture, 'button')).toHaveLength(0);

        await render(
            buildConfig({
                actions: [
                    new NoticeAction({
                        action: jest.fn(),
                        key: 'edit',
                        label: 'demo.edit',
                        type: NoticeActionType.Primary
                    }),
                    new NoticeAction({ action: jest.fn(), key: 'release', label: 'demo.release' })
                ]
            })
        );
        expect(textsOf(queryAll(fixture, 'button'))).toEqual(['Edit', 'Release']);
    });

    it('runs the action of the clicked button', async () => {
        const release = jest.fn();
        await render(
            buildConfig({ actions: [new NoticeAction({ action: release, key: 'release', label: 'demo.release' })] })
        );

        buttonByName(fixture, 'Release').click();

        expect(release).toHaveBeenCalledTimes(1);
    });
});
