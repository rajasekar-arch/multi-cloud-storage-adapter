import { UniversalCloudStorageAdapter } from "../../adapters/UniversalCloudStorageAdapter";
import { FileContent, FileMetadata, UploadOptions, DownloadOptions, ListFilesOptions, GetFileUrlOptions } from "../../types/common";
import { GcsConfig } from "./types";
export declare class GcsAdapter extends UniversalCloudStorageAdapter {
    private storage;
    constructor(config: GcsConfig);
    private getBucket;
    private getFile;
    uploadFile(bucketName: string, filePath: string, content: FileContent, options?: UploadOptions): Promise<FileMetadata>;
    downloadFile(bucketName: string, filePath: string, options?: DownloadOptions | undefined): Promise<Buffer>;
    deleteFile(bucketName: string, filePath: string): Promise<void>;
    listFiles(bucketName: string, options?: ListFilesOptions): Promise<FileMetadata[]>;
    getFileUrl(bucketName: string, filePath: string, options?: GetFileUrlOptions): Promise<string>;
    getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata>;
}
