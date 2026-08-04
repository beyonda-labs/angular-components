import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AppLayoutStyleGuideComponent } from '../app-layout/docs/style-guide/app-layout-style-guide.component';
import { BreadcrumbStyleGuideComponent } from '../breadcrumb/docs/style-guide/breadcrumb-style-guide.component';
import { FloatingPreferencesStyleGuideComponent } from '../floating-preferences/docs/style-guide/floating-preferences-style-guide.component';
import { FooterStyleGuideComponent } from '../footer/docs/style-guide/footer-style-guide.component';
import { FormStyleGuideComponent } from '../form/docs/style-guide/form-style-guide.component';
import { HeaderStyleGuideComponent } from '../header/docs/style-guide/header-style-guide.component';
import { LeftMenuStyleGuideComponent } from '../left-menu/docs/style-guide/left-menu-style-guide.component';
import { ListStyleGuideComponent } from '../list/docs/style-guide/list-style-guide.component';
import { LoadingStyleGuideComponent } from '../loading/docs/style-guide/loading-style-guide.component';
import { LoginStyleGuideComponent } from '../login/docs/style-guide/login-style-guide.component';
import { ModalStyleGuideComponent } from '../modal/docs/style-guide/modal-style-guide.component';
import { PaginationStyleGuideComponent } from '../pagination/docs/style-guide/pagination-style-guide.component';
import { PdfViewerStyleGuideComponent } from '../pdf-viewer/docs/style-guide/pdf-viewer-style-guide.component';
import { PropertiesMenuStyleGuideComponent } from '../properties-menu/docs/style-guide/properties-menu-style-guide.component';
import { TableStyleGuideComponent } from '../table/docs/style-guide/table-style-guide.component';
import { TabsStyleGuideComponent } from '../tabs/docs/style-guide/tabs-style-guide.component';
import { ToastStyleGuideComponent } from '../toast/docs/style-guide/toast-style-guide.component';
import { TreeStyleGuideComponent } from '../tree/docs/style-guide/tree-style-guide.component';

@Component({
    imports: [
        TranslateModule,
        AppLayoutStyleGuideComponent,
        BreadcrumbStyleGuideComponent,
        FloatingPreferencesStyleGuideComponent,
        FooterStyleGuideComponent,
        HeaderStyleGuideComponent,
        ModalStyleGuideComponent,
        LeftMenuStyleGuideComponent,
        ListStyleGuideComponent,
        FormStyleGuideComponent,
        PaginationStyleGuideComponent,
        PdfViewerStyleGuideComponent,
        PropertiesMenuStyleGuideComponent,
        TableStyleGuideComponent,
        ToastStyleGuideComponent,
        LoadingStyleGuideComponent,
        LoginStyleGuideComponent,
        TabsStyleGuideComponent,
        TreeStyleGuideComponent
    ],
    selector: 'bey-style-guide',
    standalone: true,
    styleUrls: ['./style-guide.component.css'],
    templateUrl: './style-guide.component.html'
})
export class StyleGuideComponent {}
