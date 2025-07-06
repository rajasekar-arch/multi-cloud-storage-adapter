"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureBlobAdapter = void 0;
// src/providers/azure/AzureBlobAdapter.ts
const storage_blob_1 = require("@azure/storage-blob");
const UniversalCloudStorageAdapter_1 = require("../../adapters/UniversalCloudStorageAdapter");
const errors_1 = require("../../types/errors");
class AzureBlobAdapter extends UniversalCloudStorageAdapter_1.UniversalCloudStorageAdapter {
    blobServiceClient;
    constructor(config) {
        super();
        try {
            if (config.connectionString) {
                const { connectionString, ...restConfig } = config;
                const options = restConfig;
                this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString, options);
            }
            else if (config.accountName && config.accountKey) {
                const { accountName, accountKey, ...restConfig } = config;
                const credential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
                const accountUrl = `https://${accountName}.blob.core.windows.net`;
                const options = restConfig;
                this.blobServiceClient = new storage_blob_1.BlobServiceClient(accountUrl, credential, options);
            }
            else {
                throw new errors_1.ProviderInitializationError('Azure Blob Storage requires either a connection string or account name and key.', { message: 'Invalid Azure configuration' });
            }
        }
        catch (error) {
            throw new errors_1.ProviderInitializationError('Failed to initialize Azure Blob Storage client.', { message: error.message, providerError: error });
        }
    }
    getContainerClient(containerName) {
        this.validateStringParam(containerName, 'containerName');
        return this.blobServiceClient.getContainerClient(containerName);
    }
    getBlockBlobClient(containerName, filePath) {
        this.validateStringParam(filePath, 'filePath');
        return this.getContainerClient(containerName).getBlockBlobClient(filePath);
    }
    async uploadFile(bucketName, filePath, content, options) {
        return this.handleProviderOperation('uploadFile', async () => {
            const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
            const bufferContent = content instanceof Buffer ? content : Buffer.from(content);
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
    async downloadFile(bucketName, filePath, options) {
        return this.handleProviderOperation('downloadFile', async () => {
            const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
            const start = options?.range ? parseInt(options.range.split('=')[1].split('-')[0], 10) : 0;
            const end = options?.range ? parseInt(options.range.split('-')[1], 10) : undefined;
            const downloadResponse = await blockBlobClient.download(start, end);
            if (!downloadResponse.readableStreamBody) {
                throw new Error('No readable stream body found for download.');
            }
            const chunks = [];
            for await (const chunk of downloadResponse.readableStreamBody) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        });
    }
    async deleteFile(bucketName, filePath) {
        return this.handleProviderOperation('deleteFile', async () => {
            const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
            await blockBlobClient.delete();
        });
    }
    async listFiles(bucketName, options) {
        return this.handleProviderOperation('listFiles', async () => {
            const containerClient = this.getContainerClient(bucketName);
            const files = [];
            let i = 0;
            for await (const blob of containerClient.listBlobsFlat({ prefix: options?.prefix })) {
                if (options?.maxKeys && i >= options.maxKeys)
                    break;
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
    async getFileUrl(bucketName, filePath, options) {
        return this.handleProviderOperation('getFileUrl', async () => {
            const blockBlobClient = this.getBlockBlobClient(bucketName, filePath);
            if (options?.public) {
                return blockBlobClient.url;
            }
            else {
                const expiryDate = new Date(Date.now() + (options?.expiresInSeconds || 3600) * 1000);
                const permissions = storage_blob_1.BlobSASPermissions.parse('r');
                const sasUrl = await blockBlobClient.generateSasUrl({
                    startsOn: new Date(),
                    expiresOn: expiryDate,
                    permissions: permissions,
                });
                return sasUrl;
            }
        });
    }
    async getFileMetadata(bucketName, filePath) {
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
exports.AzureBlobAdapter = AzureBlobAdapter;
//# sourceMappingURL=AzureBlobAdapter.js.map