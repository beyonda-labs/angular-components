import { OptionPickerOption } from '../../../internal/option-picker/models/option-picker-option.model';
import { PropertyVariable } from '../models/property-variable.model';

/** Depth-first flattening of a variable tree. */
export function flattenVariables(variables: PropertyVariable[]): PropertyVariable[] {
    return variables.flatMap(variable => [variable, ...flattenVariables(variable.children)]);
}

export function findVariable(variables: PropertyVariable[], path: string): PropertyVariable | undefined {
    return flattenVariables(variables).find(variable => variable.path === path);
}

/** Picker rows for a variable tree: the path is the option value and the type its badge. */
export function toVariableOptions(variables: PropertyVariable[], depth = 0): OptionPickerOption[] {
    return variables.flatMap(variable => [
        { badge: variable.type, depth, description: variable.path, label: variable.label, value: variable.path },
        ...toVariableOptions(variable.children, depth + 1)
    ]);
}

export function toVariableExpression(variable: PropertyVariable): string {
    return `{{ ${variable.path} }}`;
}
