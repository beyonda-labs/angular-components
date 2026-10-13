import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { controlByName, renderComponent, settle } from '@testing/dom';
import { of } from 'rxjs';

import { FormComponent } from './form.component';
import { FormListField, FormListFieldParameters } from './models/fields/form-list-field.model';
import { FormSelectField } from './models/fields/form-select-field.model';
import { FormConfig, FormHandle, FormRow, FormSection } from './models/form.model';
import { FormFieldOption, FormRule } from './models/form-field.model';

interface TeamValue {
    team: { organizationId: string; roleIds: string[] };
}

const ACME_ROLES: FormFieldOption[] = [
    { label: 'Reviewers', value: 'r1' },
    { label: 'Writers', value: 'r2' }
];
const GLOBEX_ROLES: FormFieldOption[] = [{ label: 'Reviewers', value: 'r1' }];
const ORGANIZATIONS: FormFieldOption[] = [
    { label: 'Acme', value: 'o1' },
    { label: 'Globex', value: 'o2' }
];

describe('FormComponent with lists that hold ids', () => {
    let fixture: ComponentFixture<FormComponent<TeamValue>>;
    let handle: FormHandle<TeamValue>;

    const rolesOf: FormRule<FormFieldOption[]> = value =>
        value['team']['organizationId'] === 'o1' ? ACME_ROLES : GLOBEX_ROLES;

    async function render(list: Partial<FormListFieldParameters>): Promise<void> {
        fixture = await renderComponent(FormComponent<TeamValue>, {
            config: new FormConfig<TeamValue>({
                initialValue: { team: { organizationId: 'o1', roleIds: ['r1', 'r2'] } },
                onReady: ready => (handle = ready),
                prefix: 'demo',
                sections: [
                    new FormSection({
                        key: 'team',
                        rows: [
                            new FormRow({
                                fields: [
                                    new FormSelectField({ key: 'organizationId', options: ORGANIZATIONS }),
                                    new FormListField({ key: 'roleIds', options: rolesOf, ...list })
                                ]
                            })
                        ]
                    })
                ]
            })
        });
    }

    async function chooseOrganization(id: string): Promise<void> {
        const select = controlByName<HTMLSelectElement>(fixture, 'demo.team.organization-id.label');

        select.value = id;
        select.dispatchEvent(new Event('change'));
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('drops the ids a list that suggests its own options no longer finds in them once they change', async () => {
        await render({ isRemovable: true, picker: {} });

        await chooseOrganization('o2');

        expect(handle.value().team.roleIds).toEqual(['r1']);
    });

    it('keeps every id of a list fed by a search, whose options only name its rows', async () => {
        await render({ picker: { search: () => of([]) } });

        await chooseOrganization('o2');

        expect(handle.value().team.roleIds).toEqual(['r1', 'r2']);
    });
});
