import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { buttonByName, queryAll } from './dom';

const CONFIRM_LABEL = 'angular-components.modal.actions.confirm';

export function pickInTreeDialog(label: string, confirmLabel = CONFIRM_LABEL): void {
    const item = treeDialogItems().find(candidate => candidate.textContent?.trim() === label);

    if (!item) {
        throw new Error(`No tree item named ${label}`);
    }

    item.click();
    renderDialogs();
    buttonByName(document.body, confirmLabel).click();
    renderDialogs();
}

export function treeDialogItems(): HTMLElement[] {
    renderDialogs();

    return queryAll(document.body, '[role="treeitem"]');
}

function renderDialogs(): void {
    TestBed.inject(ApplicationRef).tick();
}
