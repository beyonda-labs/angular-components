import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, cellsOf, renderComponent, settle } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { administrationStyleGuideInterceptor } from '../functions/administration-backend';
import { GroupsStyleGuideComponent } from './groups-style-guide.component';

describe('GroupsStyleGuideComponent', () => {
    let fixture: ComponentFixture<GroupsStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GroupsStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting({ interceptors: [administrationStyleGuideInterceptor] })]
        }).compileComponents();

        fixture = await renderComponent(GroupsStyleGuideComponent);
        await settle(fixture);
    });

    afterEach(() => {
        TestBed.inject(HttpTestingController).verify();
    });

    it('lists the groups the demo fakes, with their members and additional roles counted', () => {
        expect(cellsOf(fixture, 'Sales')).toEqual(expect.arrayContaining(['Sales', '2', '1']));
        expect(cellsOf(fixture, 'Support')).toEqual(expect.arrayContaining(['Support', '1', '0']));
        expect(cellsOf(fixture, 'Legal')).toEqual(expect.arrayContaining(['Legal', '0', '1']));
    });

    it('opens a group from its name with the members and the additional roles the demo fakes', async () => {
        buttonByName(fixture, 'Sales').click();
        await settle(fixture);

        const fields = fieldsOf(TestBed.inject(FakeModalFormService).forms().at(-1));

        expect(fields.map(({ key }) => key)).toEqual(['name', 'userIds', 'extraRoleIds']);
        expect(TestBed.inject(FakeModalFormService).forms().at(-1)?.initialValue).toEqual({
            main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1', 'u2'] }
        });
    });
});
