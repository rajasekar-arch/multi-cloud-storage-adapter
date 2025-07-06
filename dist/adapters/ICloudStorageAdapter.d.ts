import { FileMetadata, FileContent, UploadOptions, DownloadOptions, ListFilesOptions, GetFileUrlOptions } from '../types/common';
/**
 * Interface defining the unified API for cloud storage operations.
 */
export interface ICloudStorageAdapter {
    /**
     * Uploads a file to the specified bucket.
     * @param bucketName The name of the storage bucket.
     * @param filePath The desired path/key for the file in the bucket (e.g., 'images/profile.jpg').
     * @param content The content of the file (Buffer, string, or ReadableStream).
     * @param options Optional upload configurations.
     * @returns A promise that resolves with the metadata of the uploaded file.
     * @throws {OperationFailedError} if the upload fails.
     */
    uploadFile(bucketName: string, filePath: string, content: FileContent, options?: UploadOptions): Promise<FileMetadata>;
    /**
     * Downloads a file from the specified bucket.
     * @param bucketName The name of the storage bucket.
     * @param filePath The path/key of the file to download.
     * @param options Optional download configurations.
     * @returns A promise that resolves with the file content as a Buffer.
     * @throws {FileNotFoundError} if the file does not exist.
     * @throws {OperationFailedError} if the download fails.
     */
    downloadFile(bucketName: string, filePath: string, options?: DownloadOptions): Promise<Buffer>;
    /**
     * Deletes a file from the specified bucket.
     * @param bucketName The name of the storage bucket.
     * @param filePath The path/key of the file to delete.
     * @returns A promise that resolves when the file is successfully deleted.
     * @throws {OperationFailedError} if the deletion fails.
     */
    deleteFile(bucketName: string, filePath: string): Promise<void>;
    /**
     * Lists files within a specified bucket.
     * @param bucketName The name of the storage bucket.
     * @param options Optional listing configurations (e.g., prefix, maxKeys).
     * @returns A promise that resolves with an array of file metadata.
     * @throws {OperationFailedError} if listing fails.
     */
    listFiles(bucketName: string, options?: ListFilesOptions): Promise<FileMetadata[]>;
    /**
     * Retrieves a URL for a file. This can be a public URL or a pre-signed URL.
     * @param bucketName The name of the storage bucket.
     * @param filePath The path/key of the file.
     * @param options Optional URL configurations (e.g., expiration for signed URLs, public flag).
     * @returns A promise that resolves with the file URL as a string.
     * @throws {OperationFailedError} if URL generation fails.
     */
    getFileUrl(bucketName: string, filePath: string, options?: GetFileUrlOptions): Promise<string>;
    /**
     * Retrieves metadata for a specific file.
     * @param bucketName The name of the storage bucket.
     * @param filePath The path/key of the file.
     * @returns A promise that resolves with the file metadata.
     * @throws {FileNotFoundError} if the file does not exist.
     * @throws {OperationFailedError} if retrieving metadata fails.
     */
    getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata>;
}
