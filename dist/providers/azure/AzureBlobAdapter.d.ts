import { UniversalCloudStorageAdapter } from '../../adapters/UniversalCloudStorageAdapter';
import { FileContent, FileMetadata, UploadOptions, DownloadOptions, ListFilesOptions, GetFileUrlOptions } from '../../types/common';
import { AzureBlobConfig } from './types';
export declare class AzureBlobAdapter extends UniversalCloudStorageAdapter {
    private blobServiceClient;
    constructor(config: AzureBlobConfig);
    private getContainerClient;
    private getBlockBlobClient;
    uploadFile(bucketName: string, filePath: string, content: FileContent, options?: UploadOptions): Promise<FileMetadata>;
    downloadFile(bucketName: string, filePath: string, options?: DownloadOptions): Promise<Buffer>;
    deleteFile(bucketName: string, filePath: string): Promise<void>;
    listFiles(bucketName: string, options?: ListFilesOptions): Promise<FileMetadata[]>;
    getFileUrl(bucketName: string, filePath: string, options?: GetFileUrlOptions): Promise<string>;
    getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata>;
}
