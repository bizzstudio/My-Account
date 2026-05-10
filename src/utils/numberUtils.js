/**
 * Formats a numeric value with thousand-separator commas and fixed decimals.
 * Returns "–" for non-finite values.
 *
 * @param {number|string} value
 * @param {number} decimals  defaults to 2
 * @returns {string}  e.g. "1,500.00"
 */
export const formatPrice = (value, decimals = 2) => {
  const n = Number(String(value ?? 0).replace(/,/g, ""));
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Strips commas and parses a string or number to a plain JS number.
 * Useful for form inputs that allow the user to type commas (e.g. "1,500").
 *
 * @param {number|string} value
 * @returns {number}
 */
export const parseInputNumber = (value) => {
  return Number(String(value ?? 0).replace(/,/g, "")) || 0;
};
