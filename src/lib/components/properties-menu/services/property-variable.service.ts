import { Injectable, signal } from '@angular/core';

import { PropertyVariable, PropertyVariableParameters } from '../models/property-variable.model';

@Injectable()
export class PropertyVariableService {
    private readonly variablesSignal = signal<PropertyVariable[]>([]);

    readonly variables = this.variablesSignal.asReadonly();

    setVariables(variables: (PropertyVariableParameters | PropertyVariable)[]): void {
        this.variablesSignal.set(
            variables.map(variable =>
                variable instanceof PropertyVariable ? variable : new PropertyVariable(variable)
            )
        );
    }

    getVariables(): PropertyVariable[] {
        return this.variablesSignal();
    }

    clearVariables(): void {
        this.variablesSignal.set([]);
    }

    findByPath(path: string): PropertyVariable | undefined {
        return this.flattenVariables().find(variable => variable.path === path);
    }

    flattenVariables(): PropertyVariable[] {
        return this.flatten(this.variablesSignal());
    }

    private flatten(variables: PropertyVariable[]): PropertyVariable[] {
        return variables.reduce<PropertyVariable[]>(
            (flat, variable) => [...flat, variable, ...this.flatten(variable.children)],
            []
        );
    }
}
