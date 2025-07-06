"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalCloudStorageAdapter = void 0;
const errors_1 = require("../types/errors");
/**
 * Abstract base class for all cloud storage adapters.
 * Provides a common interface and enforces method implementations.
 */
class UniversalCloudStorageAdapter {
    constructor() {
        // Protected constructor to prevent direct instantiation
    }
    /**
     * Helper method to validate common string parameters.
     * @param value The string value to validate.
     * @param paramName The name of the parameter for error messages.
     * @throws {InvalidArgumentError} if the value is null, undefined, or empty.
     */
    validateStringParam(value, paramName) {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new errors_1.InvalidArgumentError(`${paramName} cannot be empty or null.`, { message: `${paramName} is invalid`, code: 'INVALID_ARGUMENT' });
        }
    }
    /**
     * Wraps an asynchronous operation with consistent error handling.
     * This method catches provider-specific errors and re-throws them as
     * `UniversalCloudStorageError` subclasses.
     * @param operationName The name of the operation being performed (e.g., "uploadFile").
     * @param providerSpecificCall The asynchronous function representing the cloud provider SDK call.
     * @param errorMap A map to customize error types based on provider error codes/messages.
     * @returns The result of the providerSpecificCall.
     * @throws {UniversalCloudStorageError} or its subclasses.
     */
    async handleProviderOperation(operationName, providerSpecificCall, errorMap) {
        try {
            return await providerSpecificCall();
        }
        catch (error) {
            const details = {
                message: `Provider error during ${operationName}: ${error.message || 'An unknown error occurred'}`,
                providerError: error,
            };
            // Attempt to map common provider error codes to our custom error types
            if (error.statusCode === 404 || error.code === 'NoSuchKey' || error.code === 'NotFound') {
                throw new errors_1.FileNotFoundError(`File not found during ${operationName}.`, details);
            }
            if (error.code === 'AccessDenied' || error.statusCode === 403) {
                throw new errors_1.OperationFailedError(`Permission denied during ${operationName}.`, details);
            }
            if (error.code === 'InvalidAccessKeyId' || error.code === 'SignatureDoesNotMatch' || error.code === 'InvalidCredential') {
                throw new errors_1.ProviderInitializationError(`Authentication failed during ${operationName}.`, details);
            }
            if (errorMap) {
                for (const key in errorMap) {
                    if (error.code === key || error.message.includes(key)) {
                        throw new errorMap[key](`Custom mapped error during ${operationName}.`, details);
                    }
                }
            }
            // Default to OperationFailedError for unhandled errors
            throw new errors_1.OperationFailedError(`Failed to perform ${operationName}.`, details);
        }
    }
}
exports.UniversalCloudStorageAdapter = UniversalCloudStorageAdapter;
//# sourceMappingURL=UniversalCloudStorageAdapter.js.map