import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { LoginHttpService } from '../login/services/login-http.service';
import { provideBeyModal } from '../modal/providers/modal.providers';
import { PageHttpService } from '../page/services/page-http.service';
import { StyleGuideComponent } from './style-guide.component';

describe('StyleGuideComponent', () => {
    let component: StyleGuideComponent;
    let fixture: ComponentFixture<StyleGuideComponent>;

    beforeEach(async () => {
        global.ResizeObserver = class {
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        } as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [StyleGuideComponent, TranslateModule.forRoot()],
            providers: [
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

        fixture = TestBed.createComponent(StyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
