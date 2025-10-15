/**
 * @fileoverview Custom Application Error Class
 * @description Standardized error handling across the application
 * @author Waste Management System
 * @version 1.0.0
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
