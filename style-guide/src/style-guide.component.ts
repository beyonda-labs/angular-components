import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';

import { AccountDataStyleGuideComponent } from './account-data/account-data-style-guide.component';
import { AdministrationStyleGuideComponent } from './administration/administration-style-guide.component';
import { AppLayoutStyleGuideComponent } from './app-layout/app-layout-style-guide.component';
import { BadgeStyleGuideComponent } from './badge/badge-style-guide.component';
import { BreadcrumbStyleGuideComponent } from './breadcrumb/breadcrumb-style-guide.component';
import { CardsStyleGuideComponent } from './cards/cards-style-guide.component';
import { StyleGuideSectionComponent } from './components/section/style-guide-section.component';
import { EditLockNoticeStyleGuideComponent } from './edit-lock-notice/edit-lock-notice-style-guide.component';
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
import { NoticeStyleGuideComponent } from './notice/notice-style-guide.component';
import { PageStyleGuideComponent } from './page/page-style-guide.component';
import { PaginationStyleGuideComponent } from './pagination/pagination-style-guide.component';
import { PasswordChangeStyleGuideComponent } from './password-change/password-change-style-guide.component';
import { PdfViewerStyleGuideComponent } from './pdf-viewer/pdf-viewer-style-guide.component';
import { PropertiesMenuStyleGuideComponent } from './properties-menu/properties-menu-style-guide.component';
import { SearchStyleGuideComponent } from './search/search-style-guide.component';
import { StyleGuideSectionsService } from './services/style-guide-sections.service';
import { StyleGuideTranslationService } from './services/style-guide-translation.service';
import { TableStyleGuideComponent } from './table/table-style-guide.component';
import { TabsStyleGuideComponent } from './tabs/tabs-style-guide.component';
import { ToastStyleGuideComponent } from './toast/toast-style-guide.component';
import { TreeStyleGuideComponent } from './tree/tree-style-guide.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TranslateModule,
        StyleGuideSectionComponent,
        AccountDataStyleGuideComponent,
        AdministrationStyleGuideComponent,
        AppLayoutStyleGuideComponent,
        BadgeStyleGuideComponent,
        BreadcrumbStyleGuideComponent,
        CardsStyleGuideComponent,
        EditLockNoticeStyleGuideComponent,
        FilePreviewStyleGuideComponent,
        FloatingPreferencesStyleGuideComponent,
        FooterStyleGuideComponent,
        HeaderStyleGuideComponent,
        ModalStyleGuideComponent,
        NoticeStyleGuideComponent,
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
        PageStyleGuideComponent,
        TabsStyleGuideComponent,
        TreeStyleGuideComponent
    ],
    selector: 'bey-style-guide',
    standalone: true,
    styleUrls: ['./style-guide.component.css'],
    templateUrl: './style-guide.component.html'
})
export class StyleGuideComponent {
    private readonly document = inject(DOCUMENT);
    private readonly styleGuideSectionsService = inject(StyleGuideSectionsService);
    private readonly styleGuideTranslationService = inject(StyleGuideTranslationService);

    readonly isReady = signal(false);
    readonly sections = viewChildren(StyleGuideSectionComponent);

    constructor() {
        this.styleGuideTranslationService
            .loadBundles()
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.isReady.set(true));

        const view = this.document.defaultView;

        if (view) {
            fromEvent(view, 'hashchange')
                .pipe(takeUntilDestroyed())
                .subscribe(() => this.revealLinkedSection());
        }

        effect(() => {
            if (this.sections().length > 0) {
                untracked(() => this.revealLinkedSection());
            }
        });
    }

    collapseAll(): void {
        this.styleGuideSectionsService.collapseAll();
    }

    expandAll(): void {
        this.styleGuideSectionsService.expandAll(this.sections().map(section => section.key()));
    }

    private revealLinkedSection(): void {
        const key = this.document.location.hash.slice(1);

        this.sections()
            .find(section => section.key() === key)
            ?.reveal();
    }
}
