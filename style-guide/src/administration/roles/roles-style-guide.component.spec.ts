import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BeyFormCheckboxSectionsField } from '@beyonda-labs/angular-components';
import { faFileLines, faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { buttonByName, cellsOf, renderComponent, settle } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { administrationStyleGuideInterceptor } from '../functions/administration-backend';
import rolesStyleGuideEn from './assets/roles-style-guide.en.json';
import { RolesStyleGuideComponent } from './roles-style-guide.component';

describe('RolesStyleGuideComponent', () => {
    let fixture: ComponentFixture<RolesStyleGuideComponent>;

    function permissionsField(): BeyFormCheckboxSectionsField {
        const [field] = fieldsOf<BeyFormCheckboxSectionsField>(
            TestBed.inject(FakeModalFormService).forms().at(-1),
            'permissions'
        );

        return field;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RolesStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    interceptors: [administrationStyleGuideInterceptor],
                    translations: { en: rolesStyleGuideEn }
                })
            ]
        }).compileComponents();

        fixture = await renderComponent(RolesStyleGuideComponent);
        await settle(fixture);
    });

    afterEach(() => {
        TestBed.inject(HttpTestingController).verify();
    });

    it('lists the base roles of the demo, labelled by the demo, and its additional roles', () => {
        expect(cellsOf(fixture, 'Administrator')).toEqual(
            expect.arrayContaining(['angular-components.roles.type.base'])
        );
        expect(cellsOf(fixture, 'Reviewers')).toEqual(
            expect.arrayContaining([
                'angular-components.roles.type.extra',
                'Publish the templates the editors prepare.'
            ])
        );
    });

    it('shows the permission sections in the order of the demo, each with the icon it gives', async () => {
        buttonByName(fixture, 'Administrator').click();
        await settle(fixture);

        const { sections } = permissionsField();

        expect(sections.map(({ key }) => key)).toEqual(['templates', 'documents', 'organization', 'users']);
        expect(sections.slice(0, 2).map(({ icon }) => icon)).toEqual([faFolderOpen, faFileLines]);
    });

    it('orders the permissions of a section by the actions of the demo', async () => {
        buttonByName(fixture, 'Administrator').click();
        await settle(fixture);

        const [templates] = permissionsField().sections;

        expect(templates.options.map(({ value }) => value)).toEqual([
            'templates.read',
            'templates.create',
            'templates.edit',
            'templates.publish',
            'templates.delete'
        ]);
    });
});
