import { ICloudStorageAdapter } from './ICloudStorageAdapter';
import { FileContent, FileMetadata, UploadOptions, DownloadOptions, ListFilesOptions, GetFileUrlOptions, StorageErrorDetails } from '../types/common';
import { UniversalCloudStorageError } from '../types/errors';
/**
 * Abstract base class for all cloud storage adapters.
 * Provides a common interface and enforces method implementations.
 */
export declare abstract class UniversalCloudStorageAdapter implements ICloudStorageAdapter {
    protected constructor();
    /**
     * Abstract method to upload a file. Must be implemented by concrete providers.
     */
    abstract uploadFile(bucketName: string, filePath: string, content: FileContent, options?: UploadOptions): Promise<FileMetadata>;
    /**
     * Abstract method to download a file. Must be implemented by concrete providers.
     */
    abstract downloadFile(bucketName: string, filePath: string, options?: DownloadOptions): Promise<Buffer>;
    /**
     * Abstract method to delete a file. Must be implemented by concrete providers.
     */
    abstract deleteFile(bucketName: string, filePath: string): Promise<void>;
    /**
     * Abstract method to list files. Must be implemented by concrete providers.
     */
    abstract listFiles(bucketName: string, options?: ListFilesOptions): Promise<FileMetadata[]>;
    /**
     * Abstract method to get a file URL. Must be implemented by concrete providers.
     */
    abstract getFileUrl(bucketName: string, filePath: string, options?: GetFileUrlOptions): Promise<string>;
    /**
     * Abstract method to get file metadata. Must be implemented by concrete providers.
     */
    abstract getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata>;
    /**
     * Helper method to validate common string parameters.
     * @param value The string value to validate.
     * @param paramName The name of the parameter for error messages.
     * @throws {InvalidArgumentError} if the value is null, undefined, or empty.
     */
    protected validateStringParam(value: string | undefined | null, paramName: string): void;
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
    protected handleProviderOperation<T>(operationName: string, providerSpecificCall: () => Promise<T>, errorMap?: {
        [key: string]: new (message: string, details: StorageErrorDetails) => UniversalCloudStorageError;
    }): Promise<T>;
}
