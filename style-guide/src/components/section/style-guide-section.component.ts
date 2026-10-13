import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    ElementRef,
    inject,
    Injector,
    input,
    TemplateRef
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideSectionsService } from '../../services/style-guide-sections.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, NgTemplateOutlet, TranslateModule],
    selector: 'bey-style-guide-section',
    standalone: true,
    styleUrls: ['./style-guide-section.component.css'],
    templateUrl: './style-guide-section.component.html'
})
export class StyleGuideSectionComponent {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly styleGuideSectionsService = inject(StyleGuideSectionsService);

    readonly key = input.required<string>();
    readonly titleKey = input.required<string>();

    readonly bodyId = computed(() => `${this.key()}-body`);
    readonly chevronIcon = faChevronDown;
    readonly content = contentChild.required(TemplateRef);
    readonly controlsId = computed(() => (this.isOpen() ? this.bodyId() : null));
    readonly isOpen = computed(() => this.styleGuideSectionsService.isOpen(this.key()));

    reveal(): void {
        this.styleGuideSectionsService.open(this.key());
        afterNextRender(() => this.elementRef.nativeElement.scrollIntoView({ block: 'start' }), {
            injector: this.injector
        });
    }

    toggle(): void {
        this.styleGuideSectionsService.toggle(this.key());
    }
}
