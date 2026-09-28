import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { renderComponent, settle } from '@testing/dom';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { LoginHttpService } from '../../src/lib/components/login/services/login-http.service';
import { provideBeyModal } from '../../src/lib/components/modal/providers/modal.providers';
import { PageHttpService } from '../../src/lib/components/page/services/page-http.service';
import { StyleGuideComponent } from './style-guide.component';

describe('StyleGuideComponent', () => {
    let fixture: ComponentFixture<StyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StyleGuideComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideBeyModal(),
                {
                    provide: ToastrService,
                    useValue: {
                        error: jest.fn(),
                        info: jest.fn(),
                        success: jest.fn(),
                        warning: jest.fn()
                    }
                },
                {
                    provide: LoginHttpService,
                    useValue: {
                        getProviders: jest.fn().mockReturnValue(of([])),
                        getRegisterFields: jest.fn().mockReturnValue(of([]))
                    }
                },
                {
                    provide: PageHttpService,
                    useValue: { load: jest.fn().mockReturnValue(of({ globalActions: [], results: [] })) }
                }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        TestBed.inject(TranslateService).use('en');
        fixture = await renderComponent(StyleGuideComponent);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('renders the demos once its own translations are merged', async () => {
        expect(fixture.nativeElement.textContent.trim()).toBe('');

        httpTesting
            .expectOne('assets/angular-components/i18n-style-guide/angular-components-style-guide.en.json')
            .flush({ 'angular-components-style-guide': { title: 'Style guide' } });
        await settle(fixture);

        expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Style guide');
    });
});
