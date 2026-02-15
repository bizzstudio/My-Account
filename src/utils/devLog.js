// devLog.js
// This module provides a function to log messages to the console in development mode.

/**
 * Logs a message to the console if the environment is set to development.
 * @param {string} message - The message to be logged.
 */
export default function devLog(string = '', message) {
    // Check if the environment is set to development
    if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
        // Log the message to the console
        console.log(`${string} :>> `, message);
    }
}