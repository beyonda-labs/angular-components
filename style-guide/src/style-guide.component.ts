import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { AccountDataStyleGuideComponent } from './account-data/account-data-style-guide.component';
import { AppLayoutStyleGuideComponent } from './app-layout/app-layout-style-guide.component';
import { BadgeStyleGuideComponent } from './badge/badge-style-guide.component';
import { BreadcrumbStyleGuideComponent } from './breadcrumb/breadcrumb-style-guide.component';
import { StyleGuideSectionComponent } from './components/section/style-guide-section.component';
import { FilePreviewStyleGuideComponent } from './file-preview/file-preview-style-guide.component';
import { FloatingPreferencesStyleGuideComponent } from './floating-preferences/floating-preferences-style-guide.component';
import { FooterStyleGuideComponent } from './footer/footer-style-guide.component';
import { FormStyleGuideComponent } from './form/form-style-guide.component';
import { HeaderStyleGuideComponent } from './header/header-style-guide.component';
import { LeftMenuStyleGuideComponent } from './left-menu/left-menu-style-guide.component';
import { ListStyleGuideComponent } from './list/list-style-guide.component';
import { LoadingStyleGuideComponent } from './loading/loading-style-guide.component';
import { LoginStyleGuideComponent } from './login/login-style-guide.component';
import { ModalStyleGuideComponent } from './modal/modal-style-guide.component';
import { OrganizationsStyleGuideComponent } from './organizations/organizations-style-guide.component';
import { PageStyleGuideComponent } from './page/page-style-guide.component';
import { PaginationStyleGuideComponent } from './pagination/pagination-style-guide.component';
import { PasswordChangeStyleGuideComponent } from './password-change/password-change-style-guide.component';
import { PdfViewerStyleGuideComponent } from './pdf-viewer/pdf-viewer-style-guide.component';
import { PropertiesMenuStyleGuideComponent } from './properties-menu/properties-menu-style-guide.component';
import { SearchStyleGuideComponent } from './search/search-style-guide.component';
import { StyleGuideTranslationService } from './services/style-guide-translation.service';
import { TableStyleGuideComponent } from './table/table-style-guide.component';
import { TabsStyleGuideComponent } from './tabs/tabs-style-guide.component';
import { ToastStyleGuideComponent } from './toast/toast-style-guide.component';
import { TreeStyleGuideComponent } from './tree/tree-style-guide.component';
import { UsersStyleGuideComponent } from './users/users-style-guide.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TranslateModule,
        StyleGuideSectionComponent,
        AccountDataStyleGuideComponent,
        AppLayoutStyleGuideComponent,
        BadgeStyleGuideComponent,
        BreadcrumbStyleGuideComponent,
        FilePreviewStyleGuideComponent,
        FloatingPreferencesStyleGuideComponent,
        FooterStyleGuideComponent,
        HeaderStyleGuideComponent,
        ModalStyleGuideComponent,
        LeftMenuStyleGuideComponent,
        ListStyleGuideComponent,
        FormStyleGuideComponent,
        PaginationStyleGuideComponent,
        PasswordChangeStyleGuideComponent,
        PdfViewerStyleGuideComponent,
        PropertiesMenuStyleGuideComponent,
        SearchStyleGuideComponent,
        TableStyleGuideComponent,
        ToastStyleGuideComponent,
        LoadingStyleGuideComponent,
        LoginStyleGuideComponent,
        OrganizationsStyleGuideComponent,
        PageStyleGuideComponent,
        TabsStyleGuideComponent,
        TreeStyleGuideComponent,
        UsersStyleGuideComponent
    ],
    selector: 'bey-style-guide',
    standalone: true,
    styleUrls: ['./style-guide.component.css'],
    templateUrl: './style-guide.component.html'
})
export class StyleGuideComponent {
    private readonly styleGuideTranslationService = inject(StyleGuideTranslationService);

    readonly isReady = signal(false);

    constructor() {
        this.styleGuideTranslationService
            .loadBundles()
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.isReady.set(true));
    }
}
