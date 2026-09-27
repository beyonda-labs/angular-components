import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    input,
    signal
} from '@angular/core';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType, TooltipPlacement } from '../../internal/button/models/button-config.model';
import { toKeySegment } from '../../internal/i18n/key-segment';
import { BadgeComponent } from '../badge/badge.component';
import { HeaderAction, HeaderActionType, HeaderConfig, HeaderVariant } from './models/header.model';

interface RenderedAction {
    action: HeaderAction;
    button: ButtonConfig;
    subButtons: ButtonConfig[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BadgeComponent, ButtonComponent, TranslateModule],
    selector: 'bey-header',
    standalone: true,
    styleUrls: ['./header.component.css'],
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    readonly config = input.required<HeaderConfig>();

    readonly backButton = computed(() => {
        const { backAction } = this.config();

        return backAction ? this.buildActionButton(backAction) : null;
    });
    readonly leftActions = computed(() => this.render(this.config().leftActions));
    readonly menuButtons = computed(() =>
        this.config().menuActions.map(action =>
            this.buildActionButton(action, {
                onRun: () => this.isMenuOpen.set(false),
                tooltipPlacement: 'left'
            })
        )
    );
    readonly rightActions = computed(() => this.render(this.config().rightActions));
    readonly hasActions = computed(
        () => this.leftActions().length + this.menuButtons().length + this.rightActions().length > 0
    );
    readonly isMenuOpen = signal(false);
    readonly isSubpage = computed(() => this.config().variant === HeaderVariant.SubPage);
    readonly menuToggleButton = new ButtonConfig({
        action: () => this.isMenuOpen.update(isOpen => !isOpen),
        customClass: 'bey-header-menu-toggle',
        icon: faEllipsis,
        tooltip: 'angular-components.header.menu',
        tooltipPlacement: 'left',
        type: ButtonType.Tertiary
    });
    readonly openActionKey = signal<string | null>(null);
    readonly title = computed(() => this.config().title);

    private readonly elementRef = inject(ElementRef);

    isActionMenuOpen(action: HeaderAction): boolean {
        return this.openActionKey() === action.key;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeMenus();
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.closeMenus();
    }

    private buildActionButton(
        action: HeaderAction,
        options: { onRun?: () => void; tooltipPlacement?: TooltipPlacement } = {}
    ): ButtonConfig {
        const isIconOnly = action.type === HeaderActionType.Icon;
        const run = action.action ?? ((): void => {});

        return new ButtonConfig({
            action: () => {
                options.onRun?.();
                run();
            },
            customClass: isIconOnly ? 'bey-header-action-icon' : undefined,
            icon: action.icon,
            isDisabled: action.disabled,
            label: isIconOnly ? '' : this.resolveActionText(action, 'label'),
            tooltip: this.resolveActionText(action, 'tooltip'),
            tooltipPlacement: options.tooltipPlacement,
            type: this.toButtonType(action.type)
        });
    }

    private closeMenus(): void {
        this.isMenuOpen.set(false);
        this.openActionKey.set(null);
    }

    private render(actions: HeaderAction[]): RenderedAction[] {
        return actions.map(action => {
            const hasSubActions = Boolean(action.subActions?.length);

            return {
                action,
                button: hasSubActions
                    ? this.buildActionButton({ ...action, action: undefined } as HeaderAction, {
                          onRun: () => this.toggleActionMenu(action)
                      })
                    : this.buildActionButton(action),
                subButtons: (action.subActions ?? []).map(subAction =>
                    this.buildActionButton(subAction, {
                        onRun: () => this.openActionKey.set(null),
                        tooltipPlacement: 'left'
                    })
                )
            };
        });
    }

    private resolveActionText(action: HeaderAction, field: 'label' | 'tooltip'): string {
        const value = action[field];
        const defaultValue = `${action.key}.${field}`;

        if (!value || value === defaultValue) {
            return `${this.config().prefix}.actions.${toKeySegment(action.key)}.${field}`;
        }

        return value;
    }

    private toButtonType(type: HeaderActionType): ButtonType {
        switch (type) {
            case HeaderActionType.PrimaryButton:
                return ButtonType.Primary;
            case HeaderActionType.SecondaryButton:
                return ButtonType.Secondary;
            case HeaderActionType.Icon:
            case HeaderActionType.Text:
            default:
                return ButtonType.Tertiary;
        }
    }

    private toggleActionMenu(action: HeaderAction): void {
        this.openActionKey.set(this.isActionMenuOpen(action) ? null : action.key);
    }
}
