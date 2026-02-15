/**
 * Cargo type values. Must match backend constants/cargoTypes.js (numeric).
 * באריזות (packages) רק 199, 150, 155. ברמת מוצר גם 0 = מעורב.
 */
export const PACKAGE_CARGO_TYPE_VALUES = [199, 150, 155];
export const CARGO_TYPE_MIXED = 0;
export const CARGO_TYPE_VALUES = [...PACKAGE_CARGO_TYPE_VALUES, CARGO_TYPE_MIXED];

export const DEFAULT_CARGO_TYPE = 199;
