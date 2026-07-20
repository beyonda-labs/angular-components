export enum SearchFilterOperator {
    Between = 'between',
    Contains = 'contains',
    EndsWith = 'endsWith',
    Equals = 'equals',
    GreaterThan = 'greaterThan',
    GreaterThanOrEquals = 'greaterThanOrEquals',
    LessThan = 'lessThan',
    LessThanOrEquals = 'lessThanOrEquals',
    NotContains = 'notContains',
    NotEquals = 'notEquals',
    StartsWith = 'startsWith'
}

export type BooleanFilterOperator = SearchFilterOperator.Equals | SearchFilterOperator.NotEquals;

export type NumberFilterOperator =
    | SearchFilterOperator.Between
    | SearchFilterOperator.Equals
    | SearchFilterOperator.GreaterThan
    | SearchFilterOperator.GreaterThanOrEquals
    | SearchFilterOperator.LessThan
    | SearchFilterOperator.LessThanOrEquals
    | SearchFilterOperator.NotEquals;

export type StringFilterOperator =
    | SearchFilterOperator.Contains
    | SearchFilterOperator.EndsWith
    | SearchFilterOperator.Equals
    | SearchFilterOperator.NotContains
    | SearchFilterOperator.NotEquals
    | SearchFilterOperator.StartsWith;

export abstract class SearchFilter {
    field: string;
    operator: SearchFilterOperator;

    value?: unknown;

    protected constructor(field: string, operator: SearchFilterOperator, value: unknown) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
}

export class BooleanFilter extends SearchFilter {
    declare operator: BooleanFilterOperator;
    declare value: boolean;

    constructor({ field, operator = SearchFilterOperator.Equals, value = false }: BooleanFilterParameters) {
        super(field, operator, value);
    }
}

export interface BooleanFilterParameters {
    field: string;

    operator?: BooleanFilterOperator;
    value?: boolean;
}

export class NumberFilter extends SearchFilter {
    declare operator: NumberFilterOperator;

    declare value?: number | [number, number];

    constructor({ field, operator = SearchFilterOperator.Equals, value }: NumberFilterParameters) {
        super(field, operator, value);
    }
}

export interface NumberFilterParameters {
    field: string;

    operator?: NumberFilterOperator;
    value?: number | [number, number];
}

export class StringFilter extends SearchFilter {
    declare operator: StringFilterOperator;

    declare value?: string;

    constructor({ field, operator = SearchFilterOperator.Contains, value }: StringFilterParameters) {
        super(field, operator, value);
    }
}

export interface StringFilterParameters {
    field: string;

    operator?: StringFilterOperator;
    value?: string;
}
