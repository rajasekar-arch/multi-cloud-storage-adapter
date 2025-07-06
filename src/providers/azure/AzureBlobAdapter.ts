// src/providers/azure/AzureBlobAdapter.ts
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
  StoragePipelineOptions,
  BlobSASPermissions,
} from '@azure/storage-blob';

import { UniversalCloudStorageAdapter } from '../../adapters/UniversalCloudStorageAdapter';
import {
  FileContent,
  FileMetadata,
  UploadOptions,
  DownloadOptions,
  ListFilesOptions,
  GetFileUrlOptions,
} from '../../types/common';
import { AzureBlobConfig } from './types';
import { ProviderInitializationError } from '../../types/errors';

export class AzureBlobAdapter extends UniversalCloudStorageAdapter {
  private blobServiceClient: BlobServiceClient;

  constructor(config: AzureBlobConfig) {
    super();
    try {
      if (config.connectionString) {
        const { connectionString, ...restConfig } = config;
        const options: any = restConfig;

        this.blobServiceClient = BlobServiceClient.fromConnectionString(
          connectionString,
          options
        );
      } else if (config.accountName && config.accountKey) {
        const { accountName, accountKey, ...restConfig } = config;
        const credential = new StorageSharedKeyCredential(accountName, accountKey);
        const accountUrl = `https://${accountName}.blob.core.windows.net`;
        const options: any = restConfig;

        this.blobServiceClient = new BlobServiceClient(accountUrl, credential, options);
      } else {
        throw new ProviderInitializationError(
          'Azure Blob Storage requires either a connection string or account name and key.',
          { message: 'Invalid Azure configuration' }
        );
      }
    } catch (error: any) {
      throw new ProviderInitializationError(
        'Failed to initialize Azure Blob Storage client.',
        { message: error.message, providerError: error }
      );
    }
  }

  private getContainerClient(containerName: string): ContainerClient {
    this.validateStringParam(containerName, 'containerName');
    return this.blobServiceClient.getContainerClient(containerName);
  }

  private getBlockBlobClient(containerName: string, filePath: string): BlockBlobClient {
    this.validateStringParam(filePath, 'filePath');
    return this.getContainerClient(containerName).getBlockBlobClient(filePath);
  }

  public async uploadFile(
    bucketName: string,
    filePath: string,
    content: FileContent,
    options?: UploadOptions
  ): Promise<FileMetadata> {
    return this.handleProviderOperation('uploadFile', async () => {
      const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
      const bufferContent = content instanceof Buffer ? content : Buffer.from(content as string);

      await blockBlobClient.upload(bufferContent, bufferContent.length, {
        blobHTTPHeaders: {
          blobContentType: options?.contentType,
        },
        metadata: options?.metadata,
        tags: options?.tags,
      });

      const properties = await blockBlobClient.getProperties();
      return {
        fileName: filePath.split('/').pop() || '',
        filePath: filePath,
        fileSize: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        eTag: properties.etag,
      };
    });
  }

  public async downloadFile(
    bucketName: string,
    filePath: string,
    options?: DownloadOptions
  ): Promise<Buffer> {
    return this.handleProviderOperation('downloadFile', async () => {
      const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
      const start = options?.range ? parseInt(options.range.split('=')[1].split('-')[0], 10) : 0;
      const end = options?.range ? parseInt(options.range.split('-')[1], 10) : undefined;

      const downloadResponse = await blockBlobClient.download(start, end);

      if (!downloadResponse.readableStreamBody) {
        throw new Error('No readable stream body found for download.');
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk as Buffer);
      }
      return Buffer.concat(chunks);
    });
  }

  public async deleteFile(bucketName: string, filePath: string): Promise<void> {
    return this.handleProviderOperation('deleteFile', async () => {
      const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
      await blockBlobClient.delete();
    });
  }

  public async listFiles(
    bucketName: string,
    options?: ListFilesOptions
  ): Promise<FileMetadata[]> {
    return this.handleProviderOperation('listFiles', async () => {
      const containerClient = this.getContainerClient(bucketName);
      const files: FileMetadata[] = [];
      let i = 0;
      for await (const blob of containerClient.listBlobsFlat({ prefix: options?.prefix })) {
        if (options?.maxKeys && i >= options.maxKeys) break;
        files.push({
          fileName: blob.name.split('/').pop() || '',
          filePath: blob.name,
          fileSize: blob.properties.contentLength,
          contentType: blob.properties.contentType,
          lastModified: blob.properties.lastModified,
          eTag: blob.properties.etag,
        });
        i++;
      }
      return files;
    });
  }

  public async getFileUrl(
    bucketName: string,
    filePath: string,
    options?: GetFileUrlOptions
  ): Promise<string> {
    return this.handleProviderOperation('getFileUrl', async () => {
      const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
      if (options?.public) {
        return blockBlobClient.url;
      } else {
        const expiryDate = new Date(Date.now() + (options?.expiresInSeconds || 3600) * 1000);
        const permissions = BlobSASPermissions.parse('r');
        const sasUrl = await blockBlobClient.generateSasUrl({
          startsOn: new Date(),
          expiresOn: expiryDate,
          permissions: permissions,
        });
        return sasUrl;
      }
    });
  }

  public async getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata> {
    return this.handleProviderOperation('getFileMetadata', async () => {
      const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
      const properties = await blockBlobClient.getProperties();
      return {
        fileName: filePath.split('/').pop() || '',
        filePath: filePath,
        fileSize: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        eTag: properties.etag,
      };
    });
  }
}
