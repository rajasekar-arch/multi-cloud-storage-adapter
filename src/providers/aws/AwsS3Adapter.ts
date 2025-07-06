import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommandOutput,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

import { UniversalCloudStorageAdapter } from '../../adapters/UniversalCloudStorageAdapter';
import {
  FileContent,
  FileMetadata,
  UploadOptions,
  DownloadOptions,
  ListFilesOptions,
  GetFileUrlOptions,
} from '../../types/common';
import { AwsS3Config } from './types';
import { FileNotFoundError, OperationFailedError, ProviderInitializationError } from '../../types/errors';

/**
 * AWS S3 Cloud Storage Adapter.
 * Implements the ICloudStorageAdapter interface for AWS S3.
 */
export class AwsS3Adapter extends UniversalCloudStorageAdapter {
  private s3Client: S3Client;
  private readonly defaultBucket?: string; // Optional default bucket for convenience

  constructor(config: AwsS3Config) {
    super();
    try {
      this.s3Client = new S3Client(config);
      this.defaultBucket = config.defaultBucket; // <--- Change to config.defaultBucket
    } catch (error: any) {
      throw new ProviderInitializationError(
        'Failed to initialize AWS S3 client.',
        { message: error.message, providerError: error }
      );
    }
  }

  /**
   * Helper to convert an AWS GetObjectCommandOutput body to a Buffer.
   * @param body The Readable | ReadableStream | Blob | undefined body from S3.
   * @returns A promise that resolves with the Buffer.
   */
  private async streamToBuffer(body: GetObjectCommandOutput['Body']): Promise<Buffer> {
    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(chunk as Buffer);
      }
      return Buffer.concat(chunks);
    } else if (body instanceof Blob) {
      return Buffer.from(await body.arrayBuffer());
    } else if (body instanceof Uint8Array) {
      return Buffer.from(body);
    } else if (typeof body === 'string') {
      return Buffer.from(body, 'utf-8'); // Assuming UTF-8 for string content
    }
    return Buffer.alloc(0); // Return an empty buffer if content is undefined
  }

  public async uploadFile(
    bucketName: string,
    filePath: string,
    content: FileContent,
    options?: UploadOptions
  ): Promise<FileMetadata> {
    this.validateStringParam(bucketName, 'bucketName');
    this.validateStringParam(filePath, 'filePath');

    return this.handleProviderOperation('uploadFile', async () => {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: content,
        ContentType: options?.contentType,
        ACL: options?.isPublic ? 'public-read' : undefined, // Public-read ACL for public files
        Metadata: options?.metadata,
        Tagging: options?.tags ? Object.entries(options.tags).map(([key, value]) => `${key}=${value}`).join('&') : undefined,
      });

      await this.s3Client.send(putCommand);

      // Optionally fetch metadata after upload to confirm and get ETag, LastModified
      const metadata = await this.getFileMetadata(bucketName, filePath);
      return metadata;
    });
  }

  public async downloadFile(
    bucketName: string,
    filePath: string,
    options?: DownloadOptions
  ): Promise<Buffer> {
    this.validateStringParam(bucketName, 'bucketName');
    this.validateStringParam(filePath, 'filePath');

    return this.handleProviderOperation('downloadFile', async () => {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Range: options?.range,
      });

      const response = await this.s3Client.send(getCommand);
      if (!response.Body) {
        throw new FileNotFoundError(`File not found or empty: ${filePath}`, { message: 'Empty body from S3', code: 'EmptyResponseBody' });
      }

      return this.streamToBuffer(response.Body);
    });
  }

  public async deleteFile(bucketName: string, filePath: string): Promise<void> {
    this.validateStringParam(bucketName, 'bucketName');
    this.validateStringParam(filePath, 'filePath');

    return this.handleProviderOperation('deleteFile', async () => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });
      await this.s3Client.send(deleteCommand);
    });
  }

  public async listFiles(
    bucketName: string,
    options?: ListFilesOptions
  ): Promise<FileMetadata[]> {
    this.validateStringParam(bucketName, 'bucketName');

    return this.handleProviderOperation('listFiles', async () => {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: options?.prefix,
        MaxKeys: options?.maxKeys,
        StartAfter: options?.startAfter,
      });

      const response: ListObjectsV2CommandOutput = await this.s3Client.send(listCommand);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((item) => ({
        fileName: item.Key?.split('/').pop() || '',
        filePath: item.Key || '',
        fileSize: item.Size,
        lastModified: item.LastModified,
        eTag: item.ETag?.replace(/"/g, ''), // Remove quotes from ETag
      }));
    });
  }

  public async getFileUrl(
    bucketName: string,
    filePath: string,
    options?: GetFileUrlOptions
  ): Promise<string> {
    this.validateStringParam(bucketName, 'bucketName');
    this.validateStringParam(filePath, 'filePath');

    return this.handleProviderOperation('getFileUrl', async () => {
      if (options?.public) {
        // Construct public URL directly for S3
        // This assumes the bucket is configured for public access
        const region = await this.s3Client.config.region();
        return `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
      } else {
        // Generate a signed URL
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: filePath,
        });
        const expiresInSeconds = options?.expiresInSeconds || 3600; // Default to 1 hour
        return getSignedUrl(this.s3Client, getCommand, {
          expiresIn: expiresInSeconds,
        });
      }
    });
  }

  public async getFileMetadata(
    bucketName: string,
    filePath: string
  ): Promise<FileMetadata> {
    this.validateStringParam(bucketName, 'bucketName');
    this.validateStringParam(filePath, 'filePath');

    return this.handleProviderOperation('getFileMetadata', async () => {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });

      try {
        const response = await this.s3Client.send(headCommand);
        return {
          fileName: filePath.split('/').pop() || '',
          filePath: filePath,
          fileSize: response.ContentLength,
          contentType: response.ContentType,
          lastModified: response.LastModified,
          eTag: response.ETag?.replace(/"/g, ''), // Remove quotes from ETag
          // Map custom metadata if available
          ...response.Metadata,
        };
      } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          throw new FileNotFoundError(`File not found: ${filePath} in bucket ${bucketName}`, { message: error.message, code: 'NoSuchKey' });
        }
        throw error; // Re-throw other errors for handleProviderOperation to catch
      }
    });
  }
}

