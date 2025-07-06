import { StorageErrorDetails } from './common';

export class UniversalCloudStorageError extends Error {
  public name: string = 'UniversalCloudStorageError';
  public readonly details: StorageErrorDetails;

  constructor(message: string, details: StorageErrorDetails) {
    super(message);
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, UniversalCloudStorageError.prototype);
    this.details = details;
  }
}

export class ProviderInitializationError extends UniversalCloudStorageError {
  constructor(message: string, details: StorageErrorDetails) {
    super(message, details);
    this.name = 'ProviderInitializationError';
    Object.setPrototypeOf(this, ProviderInitializationError.prototype);
  }
}

export class FileNotFoundError extends UniversalCloudStorageError {
  constructor(message: string, details: StorageErrorDetails) {
    super(message, details);
    this.name = 'FileNotFoundError';
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}

export class OperationFailedError extends UniversalCloudStorageError {
  constructor(message: string, details: StorageErrorDetails) {
    super(message, details);
    this.name = 'OperationFailedError';
    Object.setPrototypeOf(this, OperationFailedError.prototype);
  }
}

export class InvalidArgumentError extends UniversalCloudStorageError {
  constructor(message: string, details: StorageErrorDetails) {
    super(message, details);
    this.name = 'InvalidArgumentError';
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}