const httpStatusCodes = require('../helpers/httpStautsCodes');

/**
 * Sends a JSON response with a "Not Found" error message.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=404] - The HTTP status code.
 * @param {string} [description='Not found.'] - The error description.
 * @returns {Object} The JSON response.
 */
function apiNotFound(res, message, statusCode = httpStatusCodes.NOT_FOUND,  description = 'Not found. ') {
    return res.status(statusCode).json({
        message,
        statusCode,
        description
    });
}


/**
 * Sends a JSON response with a bad request error.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=400] - The status code of the response.
 * @param {string} [description='Bad request.'] - The description of the error.
 * @returns {Object} The JSON response with the error details.
 */
function apiBadRequest(res, message, statusCode = httpStatusCodes.BAD_REQUEST,  description = 'Bad request. ') {
    return res.status(statusCode).json({
        message,
        statusCode,     
        description
    });
}


/**
 * Sends an API response with an unauthorized status code and error details.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=401] - The status code to be sent in the response. Defaults to 401 (UNAUTHORIZED).
 * @param {boolean} [isOperational=true] - Indicates whether the error is operational or not. Defaults to true.
 * @param {string} [description='Unauthorized.'] - The description of the error. Defaults to 'Unauthorized.'.
 * @returns {Object} The response object with the error details.
 */
function apiUnauthorized(res, message, statusCode = httpStatusCodes.UNAUTHORIZED,  description = 'Unauthorized. ') {
    return res.status(statusCode).json({
        message,
        statusCode,      
        description
    });
}


/**
 * Sends a JSON response with a Forbidden status code.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=403] - The status code to send.
 * @param {string} [description='Forbidden.'] - The description of the error.
 * @returns {Object} The response object with the JSON data.
 */
function apiForbidden(res, message, statusCode = httpStatusCodes.FORBIDDEN,  description = 'Forbidden. ') {
    return res.status(statusCode).json({
        message,
        statusCode, 
        description
    });
}

/**
 * Sends an API internal server error response.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=500] - The status code of the response.
 * @param {string} [description='Internal server error.'] - The error description.
 * @returns {Object} The response object.
 */
function apiInternalServerError(res, message, statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR,  description = 'Internal server error. ') {
    return res.status(statusCode).json({
        message,
        statusCode,
        description
    });
}


/**
 * Sends a JSON response with a service unavailable error.
 *
 * @param {Object} res - The response object.
 * @param {string} message - The message of the error.
 * @param {number} [statusCode=503] - The HTTP status code.
 * @param {string} [description='Service unavailable.'] - The error description.
 * @returns {Object} The JSON response with the error details.
 */
function apiServiceUnavailable(res, message, statusCode = httpStatusCodes.SERVICE_UNAVAILABLE,  description = 'Service unavailable. ') {
    return res.status(statusCode).json({
        message,
        statusCode,     
        description
    });
}

module.exports = {
    apiNotFound,
    apiBadRequest,
    apiUnauthorized,
    apiForbidden,
    apiInternalServerError,
    apiServiceUnavailable
}