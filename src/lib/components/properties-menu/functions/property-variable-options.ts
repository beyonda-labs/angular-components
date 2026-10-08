import { OptionPickerOption } from '../../../internal/option-picker/models/option-picker-option.model';
import { PropertyVariable } from '../models/property-variable.model';

export function findVariable(variables: PropertyVariable[], path: string): PropertyVariable | undefined {
    return flattenVariables(variables).find(variable => variable.path === path);
}

export function flattenVariables(variables: PropertyVariable[]): PropertyVariable[] {
    return variables.flatMap(variable => [variable, ...flattenVariables(variable.children)]);
}

export function toVariableExpression(variable: PropertyVariable): string {
    return `{{ ${variable.path} }}`;
}

export function toVariableOptions(variables: PropertyVariable[], depth = 0): OptionPickerOption[] {
    return variables.flatMap(variable => [
        { badge: variable.type, depth, description: variable.path, label: variable.label, value: variable.path },
        ...toVariableOptions(variable.children, depth + 1)
    ]);
}
