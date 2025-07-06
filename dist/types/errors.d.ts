import { StorageErrorDetails } from './common';
export declare class UniversalCloudStorageError extends Error {
    name: string;
    readonly details: StorageErrorDetails;
    constructor(message: string, details: StorageErrorDetails);
}
export declare class ProviderInitializationError extends UniversalCloudStorageError {
    constructor(message: string, details: StorageErrorDetails);
}
export declare class FileNotFoundError extends UniversalCloudStorageError {
    constructor(message: string, details: StorageErrorDetails);
}
export declare class OperationFailedError extends UniversalCloudStorageError {
    constructor(message: string, details: StorageErrorDetails);
}
export declare class InvalidArgumentError extends UniversalCloudStorageError {
    constructor(message: string, details: StorageErrorDetails);
}
