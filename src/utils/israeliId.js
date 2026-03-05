/**
 * Normalize Israeli ID for validation (e.g. from Excel: leading zero is often dropped → 8 digits).
 * @param {string|number} value - Raw input
 * @returns {string} 9-digit string (with leading zero if 8 digits), or empty string if empty/invalid length
 */
export function normalizeIsraeliID(value) {
  if (value === undefined || value === null) return "";
  // Avoid scientific notation: if it's a number, use fixed string
  const raw = typeof value === "number" ? String(Math.floor(value)) : String(value).trim();
  const str = raw.replace(/\D/g, "");
  if (str.length === 0) return "";
  if (str.length === 9) return str;
  if (str.length === 8) return "0" + str; // Excel often drops leading zero
  return str;
}

/**
 * Validation for Israeli ID number (תעודת זהות).
 * 9 digits, last digit is Luhn-style check digit.
 * @param {string|number} id - Raw input (may contain spaces/dashes, or 8 digits from Excel)
 * @returns {boolean} true if valid Israeli ID or empty (for optional fields)
 */
export function isValidIsraeliID(id) {
  if (id === undefined || id === null) return true;
  const str = String(id).trim().replace(/\D/g, "");
  if (str.length === 0) return true;
  // Allow 8 digits (normalize to 9 with leading zero, then validate)
  const normalized = str.length === 8 ? "0" + str : str;
  if (normalized.length !== 9) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let n = parseInt(normalized[i], 10);
    if (i % 2 === 0) {
      sum += n;
    } else {
      n *= 2;
      sum += n > 9 ? n - 9 : n;
    }
  }
  sum += parseInt(normalized[8], 10);
  return sum % 10 === 0;
}

/**
 * For required ID fields: empty is invalid.
 * For optional ID fields: empty is valid, non-empty must be valid ID.
 */
export function validateIsraeliIDOptional(value) {
  if (value === undefined || value === null) return true;
  const str = String(value).trim().replace(/\D/g, "");
  if (str.length === 0) return true;
  return isValidIsraeliID(value);
}

export function validateIsraeliIDRequired(value) {
  if (value === undefined || value === null || String(value).trim() === "") return false;
  return isValidIsraeliID(value);
}
