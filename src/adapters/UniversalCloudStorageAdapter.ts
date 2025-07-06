import { ICloudStorageAdapter } from './ICloudStorageAdapter';
import {
  FileContent,
  FileMetadata,
  UploadOptions,
  DownloadOptions,
  ListFilesOptions,
  GetFileUrlOptions,
  StorageErrorDetails,
} from '../types/common';
import {
  UniversalCloudStorageError,
  ProviderInitializationError,
  FileNotFoundError,
  OperationFailedError,
  InvalidArgumentError,
} from '../types/errors';

/**
 * Abstract base class for all cloud storage adapters.
 * Provides a common interface and enforces method implementations.
 */
export abstract class UniversalCloudStorageAdapter implements ICloudStorageAdapter {
  protected constructor() {
    // Protected constructor to prevent direct instantiation
  }

  /**
   * Abstract method to upload a file. Must be implemented by concrete providers.
   */
  public abstract uploadFile(
    bucketName: string,
    filePath: string,
    content: FileContent,
    options?: UploadOptions
  ): Promise<FileMetadata>;

  /**
   * Abstract method to download a file. Must be implemented by concrete providers.
   */
  public abstract downloadFile(
    bucketName: string,
    filePath: string,
    options?: DownloadOptions
  ): Promise<Buffer>;

  /**
   * Abstract method to delete a file. Must be implemented by concrete providers.
   */
  public abstract deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<void>;

  /**
   * Abstract method to list files. Must be implemented by concrete providers.
   */
  public abstract listFiles(
    bucketName: string,
    options?: ListFilesOptions
  ): Promise<FileMetadata[]>;

  /**
   * Abstract method to get a file URL. Must be implemented by concrete providers.
   */
  public abstract getFileUrl(
    bucketName: string,
    filePath: string,
    options?: GetFileUrlOptions
  ): Promise<string>;

  /**
   * Abstract method to get file metadata. Must be implemented by concrete providers.
   */
  public abstract getFileMetadata(
    bucketName: string,
    filePath: string
  ): Promise<FileMetadata>;

  /**
   * Helper method to validate common string parameters.
   * @param value The string value to validate.
   * @param paramName The name of the parameter for error messages.
   * @throws {InvalidArgumentError} if the value is null, undefined, or empty.
   */
  protected validateStringParam(value: string | undefined | null, paramName: string): void {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new InvalidArgumentError(
        `${paramName} cannot be empty or null.`,
        { message: `${paramName} is invalid`, code: 'INVALID_ARGUMENT' }
      );
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
  protected async handleProviderOperation<T>(
    operationName: string,
    providerSpecificCall: () => Promise<T>,
    errorMap?: { [key: string]: new (message: string, details: StorageErrorDetails) => UniversalCloudStorageError }
  ): Promise<T> {
    try {
      return await providerSpecificCall();
    } catch (error: any) {
      const details: StorageErrorDetails = {
        message: `Provider error during ${operationName}: ${error.message || 'An unknown error occurred'}`,
        providerError: error,
      };

      // Attempt to map common provider error codes to our custom error types
      if (error.statusCode === 404 || error.code === 'NoSuchKey' || error.code === 'NotFound') {
        throw new FileNotFoundError(`File not found during ${operationName}.`, details);
      }
      if (error.code === 'AccessDenied' || error.statusCode === 403) {
        throw new OperationFailedError(`Permission denied during ${operationName}.`, details);
      }
      if (error.code === 'InvalidAccessKeyId' || error.code === 'SignatureDoesNotMatch' || error.code === 'InvalidCredential') {
        throw new ProviderInitializationError(`Authentication failed during ${operationName}.`, details);
      }
      if (errorMap) {
        for (const key in errorMap) {
          if (error.code === key || error.message.includes(key)) {
            throw new errorMap[key](`Custom mapped error during ${operationName}.`, details);
          }
        }
      }

      // Default to OperationFailedError for unhandled errors
      throw new OperationFailedError(`Failed to perform ${operationName}.`, details);
    }
  }
}