import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { HeaderAction, HeaderActionType, HeaderConfig } from './models/header.model';

@Component({
    imports: [ButtonComponent, CommonModule, TranslateModule],
    selector: 'bey-header',
    standalone: true,
    styleUrls: ['./header.component.css'],
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    @Input({ required: true }) config!: HeaderConfig;

    isMenuOpen = false;
    openActionKey: string | null = null;

    private readonly elementRef = inject(ElementRef);

    get leftActions(): HeaderAction[] {
        return this.config?.leftActions ?? [];
    }

    get menuActions(): HeaderAction[] {
        return this.config?.menuActions ?? [];
    }

    get rightActions(): HeaderAction[] {
        return this.config?.rightActions ?? [];
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isMenuOpen = false;
            this.openActionKey = null;
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.isMenuOpen = false;
        this.openActionKey = null;
    }

    getTitle(): string {
        return this.config.title ?? '';
    }

    getActionButton(action: HeaderAction): ButtonConfig {
        return new ButtonConfig({
            action: action.action ?? (() => {}),
            icon: action.icon,
            isDisabled: action.disabled,
            label: this.resolveActionText(action, 'label'),
            tooltip: this.resolveActionText(action, 'tooltip'),
            type: this.getButtonType(action.type)
        });
    }

    getMenuActionButton(action: HeaderAction): ButtonConfig {
        const button = this.getActionButton(action);
        const buttonAction = button.action;

        button.action = () => {
            this.isMenuOpen = false;
            buttonAction();
        };

        return button;
    }

    getMenuToggleButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.toggleMenu(),
            customClass: 'bey-header-menu-toggle',
            icon: faEllipsis,
            tooltip: 'angular-components.header.menu',
            type: ButtonType.Tertiary
        });
    }

    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    hasSubActions(action: HeaderAction): boolean {
        return Boolean(action.subActions?.length);
    }

    isActionMenuOpen(action: HeaderAction): boolean {
        return this.openActionKey === action.key;
    }

    toggleActionMenu(action: HeaderAction): void {
        this.openActionKey = this.isActionMenuOpen(action) ? null : action.key;
    }

    getActionToggleButton(action: HeaderAction): ButtonConfig {
        const button = this.getActionButton(action);

        button.action = () => this.toggleActionMenu(action);

        return button;
    }

    getSubActionButton(subAction: HeaderAction): ButtonConfig {
        const button = this.getActionButton(subAction);
        const buttonAction = button.action;

        button.action = () => {
            this.openActionKey = null;
            buttonAction();
        };

        return button;
    }

    private getButtonType(type: HeaderActionType): ButtonType {
        switch (type) {
            case HeaderActionType.PrimaryButton:
                return ButtonType.Primary;
            case HeaderActionType.SecondaryButton:
                return ButtonType.Secondary;
            case HeaderActionType.Text:
            default:
                return ButtonType.Tertiary;
        }
    }

    private resolveActionText(action: HeaderAction, field: 'label' | 'tooltip'): string {
        const value = action[field];
        const defaultValue = `${action.key}.${field}`;

        if (!value || value === defaultValue) {
            return `${this.config.prefix}.actions.${defaultValue}`;
        }

        return value;
    }
}
