"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidArgumentError = exports.OperationFailedError = exports.FileNotFoundError = exports.ProviderInitializationError = exports.UniversalCloudStorageError = void 0;
class UniversalCloudStorageError extends Error {
    name = 'UniversalCloudStorageError';
    details;
    constructor(message, details) {
        super(message);
        // Set the prototype explicitly to ensure `instanceof` works correctly
        Object.setPrototypeOf(this, UniversalCloudStorageError.prototype);
        this.details = details;
    }
}
exports.UniversalCloudStorageError = UniversalCloudStorageError;
class ProviderInitializationError extends UniversalCloudStorageError {
    constructor(message, details) {
        super(message, details);
        this.name = 'ProviderInitializationError';
        Object.setPrototypeOf(this, ProviderInitializationError.prototype);
    }
}
exports.ProviderInitializationError = ProviderInitializationError;
class FileNotFoundError extends UniversalCloudStorageError {
    constructor(message, details) {
        super(message, details);
        this.name = 'FileNotFoundError';
        Object.setPrototypeOf(this, FileNotFoundError.prototype);
    }
}
exports.FileNotFoundError = FileNotFoundError;
class OperationFailedError extends UniversalCloudStorageError {
    constructor(message, details) {
        super(message, details);
        this.name = 'OperationFailedError';
        Object.setPrototypeOf(this, OperationFailedError.prototype);
    }
}
exports.OperationFailedError = OperationFailedError;
class InvalidArgumentError extends UniversalCloudStorageError {
    constructor(message, details) {
        super(message, details);
        this.name = 'InvalidArgumentError';
        Object.setPrototypeOf(this, InvalidArgumentError.prototype);
    }
}
exports.InvalidArgumentError = InvalidArgumentError;
//# sourceMappingURL=errors.js.map