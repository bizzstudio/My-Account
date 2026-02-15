/**
 * Address Helper
 * Handles both old (string) and new (object) address formats
 */

/**
 * Format address to display string
 * Supports both legacy string format and new object format
 * @param {string|Object} address - Address in either format
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';

  // Legacy format: address is a string
  if (typeof address === 'string') {
    return address;
  }

  // New format: address is an object
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.houseNumber,
      address.floor ? `קומה ${address.floor}` : '',
      address.apartment ? `דירה ${address.apartment}` : ''
    ].filter(Boolean);

    return parts.join(', ');
  }

  return '';
};

/**
 * Check if address is in old string format
 * @param {string|Object} address
 * @returns {boolean}
 */
export const isLegacyAddress = (address) => {
  return address && typeof address === 'string';
};

/**
 * Convert legacy string address to new object format
 * @param {string} legacyAddress - Old string format address
 * @returns {Object} Address object with street, houseNumber, floor, apartment
 */
export const convertLegacyAddress = (legacyAddress) => {
  if (!legacyAddress || typeof legacyAddress !== 'string') {
    return {
      street: '',
      houseNumber: '',
      floor: '',
      apartment: ''
    };
  }

  // Return old address in street field for now
  // User can edit it properly when editing the order
  return {
    street: legacyAddress,
    houseNumber: '',
    floor: '',
    apartment: ''
  };
};

/**
 * Get address object (handles both formats)
 * @param {string|Object} address
 * @returns {Object} Address object
 */
export const getAddressObject = (address) => {
  if (!address) {
    return {
      street: '',
      houseNumber: '',
      floor: '',
      apartment: ''
    };
  }

  if (typeof address === 'string') {
    return convertLegacyAddress(address);
  }

  return address;
};
