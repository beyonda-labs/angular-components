import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    HostListener,
    inject,
    Injector,
    input,
    output,
    signal,
    viewChild
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { TableColumnsMenuEntry } from '../../models/table.model';

const PANEL_GAP_PX = 4;

interface PanelPosition {
    right: number;
    top: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-table-columns-menu',
    standalone: true,
    styleUrls: ['./columns-menu.component.css'],
    templateUrl: './columns-menu.component.html'
})
export class TableColumnsMenuComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);

    readonly entries = input.required<TableColumnsMenuEntry[]>();

    readonly columnsReset = output<void>();
    readonly columnToggle = output<string>();

    readonly icon = faTableColumns;
    readonly isOpen = signal(false);
    readonly position = signal<PanelPosition>({ right: 0, top: 0 });

    private readonly onAncestorScroll = (event: Event): void => {
        if (!this.panel()?.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    };
    private readonly onWindowResize = (): void => this.place();
    private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
    private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

    constructor() {
        this.destroyRef.onDestroy(() => this.stopListening());
    }

    close(): void {
        if (!this.isOpen()) {
            return;
        }

        this.isOpen.set(false);
        this.stopListening();
    }

    onColumnChange(entry: TableColumnsMenuEntry): void {
        this.columnToggle.emit(entry.key);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    }

    @HostListener('keydown.escape')
    onEscape(): void {
        if (this.isOpen()) {
            this.close();
            this.trigger().nativeElement.focus();
        }
    }

    @HostListener('focusout', ['$event'])
    onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;

        if (next && !this.elementRef.nativeElement.contains(next)) {
            this.close();
        }
    }

    onReset(): void {
        this.columnsReset.emit();
    }

    toggle(): void {
        if (this.isOpen()) {
            this.close();

            return;
        }

        this.place();
        this.isOpen.set(true);
        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('scroll', this.onAncestorScroll, { capture: true });
        afterNextRender(() => this.focusFirstControl(), { injector: this.injector });
    }

    private focusFirstControl(): void {
        this.panel()?.nativeElement.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
    }

    private place(): void {
        const rect = this.trigger().nativeElement.getBoundingClientRect();

        this.position.set({
            right: document.documentElement.clientWidth - rect.right,
            top: rect.bottom + PANEL_GAP_PX
        });
    }

    private stopListening(): void {
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
    }
}
