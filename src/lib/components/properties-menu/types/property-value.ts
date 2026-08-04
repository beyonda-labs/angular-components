export type PropertyPrimitiveValue = string | number | boolean;

export interface PropertySpacingValue {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

export type PropertyValue = PropertyPrimitiveValue | PropertySpacingValue;
