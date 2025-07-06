export interface FileMetadata {
  fileName: string;
  filePath: string; // Full path including directory (if applicable)
  fileSize?: number; // In bytes
  contentType?: string;
  lastModified?: Date;
  eTag?: string; // Entity tag for the file
  url?: string; // Public or signed URL (if applicable)
  // Add any other common metadata fields as needed
  [key: string]: any; // Allow for provider-specific metadata
}

export interface UploadOptions {
  contentType?: string;
  /**
   * Optional. If true, the uploaded file will be publicly accessible.
   * Note: This might require specific ACLs or bucket policies on the provider.
   * Default is false (private).
   */
  isPublic?: boolean;
  metadata?: { [key: string]: string }; // Custom metadata for the file
  tags?: { [key: string]: string }; // Tags for the file (if supported by provider)
}

export interface DownloadOptions {
  range?: string; // e.g., "bytes=0-999"
}

export interface ListFilesOptions {
  prefix?: string; // Filter files by a common prefix
  maxKeys?: number; // Maximum number of files to return
  startAfter?: string; // Start listing files after a specific key
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
  providerError?: any; // The original error from the cloud provider SDK
}