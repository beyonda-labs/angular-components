import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { PreferencesService } from '../../services/preferences/preferences.service';
import { Theme, ThemeService } from '../../services/theme/theme.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-floating-preferences',
    standalone: true,
    styleUrls: ['./floating-preferences.component.css'],
    templateUrl: './floating-preferences.component.html'
})
export class FloatingPreferencesComponent {
    private readonly preferencesService = inject(PreferencesService);
    private readonly themeService = inject(ThemeService);
    private readonly translateService = inject(TranslateService);

    readonly usePill = input(true);

    readonly chevronIcon = faChevronDown;
    readonly language = toSignal(this.translateService.onLangChange.pipe(map(event => event.lang)), {
        initialValue: this.translateService.currentLang ?? this.translateService.defaultLang
    });
    readonly languages = this.preferencesService.languages;
    readonly theme = toSignal(this.themeService.theme$, { initialValue: 'light' as const });

    onLangChange(value: string): void {
        this.preferencesService.setLanguage(value);
    }

    onThemeChange(value: string): void {
        this.preferencesService.setTheme(value as Theme);
    }
}
