import { UniversalCloudStorageAdapter } from '../../adapters/UniversalCloudStorageAdapter';
import { FileContent, FileMetadata, UploadOptions, DownloadOptions, ListFilesOptions, GetFileUrlOptions } from '../../types/common';
import { AwsS3Config } from './types';
/**
 * AWS S3 Cloud Storage Adapter.
 * Implements the ICloudStorageAdapter interface for AWS S3.
 */
export declare class AwsS3Adapter extends UniversalCloudStorageAdapter {
    private s3Client;
    private readonly defaultBucket?;
    constructor(config: AwsS3Config);
    /**
     * Helper to convert an AWS GetObjectCommandOutput body to a Buffer.
     * @param body The Readable | ReadableStream | Blob | undefined body from S3.
     * @returns A promise that resolves with the Buffer.
     */
    private streamToBuffer;
    uploadFile(bucketName: string, filePath: string, content: FileContent, options?: UploadOptions): Promise<FileMetadata>;
    downloadFile(bucketName: string, filePath: string, options?: DownloadOptions): Promise<Buffer>;
    deleteFile(bucketName: string, filePath: string): Promise<void>;
    listFiles(bucketName: string, options?: ListFilesOptions): Promise<FileMetadata[]>;
    getFileUrl(bucketName: string, filePath: string, options?: GetFileUrlOptions): Promise<string>;
    getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata>;
}
