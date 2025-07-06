export interface FileMetadata {
    fileName: string;
    filePath: string;
    fileSize?: number;
    contentType?: string;
    lastModified?: Date;
    eTag?: string;
    url?: string;
    [key: string]: any;
}
export interface UploadOptions {
    contentType?: string;
    /**
     * Optional. If true, the uploaded file will be publicly accessible.
     * Note: This might require specific ACLs or bucket policies on the provider.
     * Default is false (private).
     */
    isPublic?: boolean;
    metadata?: {
        [key: string]: string;
    };
    tags?: {
        [key: string]: string;
    };
}
export interface DownloadOptions {
    range?: string;
}
export interface ListFilesOptions {
    prefix?: string;
    maxKeys?: number;
    startAfter?: string;
}
export interface GetFileUrlOptions {
    /**
     * The expiration time in seconds for a signed URL.
     * Only applicable for signed URLs. Default to 3600 (1 hour).
     */
    expiresInSeconds?: number;
    /**
     * If true, generates a publicly accessible URL.
     * If false or not provided, generates a signed URL (if supported and not public).
     */
    public?: boolean;
}
export type FileContent = Buffer | string | ReadableStream;
export interface StorageErrorDetails {
    code?: string;
    message: string;
    statusCode?: number;
    providerError?: any;
}
