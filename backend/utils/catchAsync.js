/**
 * @fileoverview Async Error Handler Wrapper
 * @description Wraps async route handlers to catch errors
 * @author Waste Management System
 * @version 1.0.0
 */

/**
 * Wraps async functions to catch errors and pass to next middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
