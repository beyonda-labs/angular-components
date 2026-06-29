import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FloatingPreferencesComponent } from '../../floating-preferences.component';

@Component({
    imports: [FloatingPreferencesComponent, TranslateModule],
    selector: 'bey-floating-preferences-style-guide',
    standalone: true,
    templateUrl: './floating-preferences-style-guide.component.html'
})
export class FloatingPreferencesStyleGuideComponent {}
