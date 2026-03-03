/**
 * Validation for Israeli ID number (תעודת זהות).
 * 9 digits, last digit is Luhn-style check digit.
 * @param {string|number} id - Raw input (may contain spaces/dashes)
 * @returns {boolean} true if valid Israeli ID or empty (for optional fields)
 */
export function isValidIsraeliID(id) {
  if (id === undefined || id === null) return true;
  const str = String(id).trim().replace(/\D/g, "");
  if (str.length === 0) return true;
  if (str.length !== 9) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let n = parseInt(str[i], 10);
    if (i % 2 === 0) {
      sum += n;
    } else {
      n *= 2;
      sum += n > 9 ? n - 9 : n;
    }
  }
  sum += parseInt(str[8], 10);
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
