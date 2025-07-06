"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Adapter = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const stream_1 = require("stream");
const UniversalCloudStorageAdapter_1 = require("../../adapters/UniversalCloudStorageAdapter");
const errors_1 = require("../../types/errors");
/**
 * AWS S3 Cloud Storage Adapter.
 * Implements the ICloudStorageAdapter interface for AWS S3.
 */
class AwsS3Adapter extends UniversalCloudStorageAdapter_1.UniversalCloudStorageAdapter {
    s3Client;
    defaultBucket; // Optional default bucket for convenience
    constructor(config) {
        super();
        try {
            this.s3Client = new client_s3_1.S3Client(config);
            this.defaultBucket = config.defaultBucket; // <--- Change to config.defaultBucket
        }
        catch (error) {
            throw new errors_1.ProviderInitializationError('Failed to initialize AWS S3 client.', { message: error.message, providerError: error });
        }
    }
    /**
     * Helper to convert an AWS GetObjectCommandOutput body to a Buffer.
     * @param body The Readable | ReadableStream | Blob | undefined body from S3.
     * @returns A promise that resolves with the Buffer.
     */
    async streamToBuffer(body) {
        if (body instanceof stream_1.Readable) {
            const chunks = [];
            for await (const chunk of body) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        else if (body instanceof Blob) {
            return Buffer.from(await body.arrayBuffer());
        }
        else if (body instanceof Uint8Array) {
            return Buffer.from(body);
        }
        else if (typeof body === 'string') {
            return Buffer.from(body, 'utf-8'); // Assuming UTF-8 for string content
        }
        return Buffer.alloc(0); // Return an empty buffer if content is undefined
    }
    async uploadFile(bucketName, filePath, content, options) {
        this.validateStringParam(bucketName, 'bucketName');
        this.validateStringParam(filePath, 'filePath');
        return this.handleProviderOperation('uploadFile', async () => {
            const putCommand = new client_s3_1.PutObjectCommand({
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
    async downloadFile(bucketName, filePath, options) {
        this.validateStringParam(bucketName, 'bucketName');
        this.validateStringParam(filePath, 'filePath');
        return this.handleProviderOperation('downloadFile', async () => {
            const getCommand = new client_s3_1.GetObjectCommand({
                Bucket: bucketName,
                Key: filePath,
                Range: options?.range,
            });
            const response = await this.s3Client.send(getCommand);
            if (!response.Body) {
                throw new errors_1.FileNotFoundError(`File not found or empty: ${filePath}`, { message: 'Empty body from S3', code: 'EmptyResponseBody' });
            }
            return this.streamToBuffer(response.Body);
        });
    }
    async deleteFile(bucketName, filePath) {
        this.validateStringParam(bucketName, 'bucketName');
        this.validateStringParam(filePath, 'filePath');
        return this.handleProviderOperation('deleteFile', async () => {
            const deleteCommand = new client_s3_1.DeleteObjectCommand({
                Bucket: bucketName,
                Key: filePath,
            });
            await this.s3Client.send(deleteCommand);
        });
    }
    async listFiles(bucketName, options) {
        this.validateStringParam(bucketName, 'bucketName');
        return this.handleProviderOperation('listFiles', async () => {
            const listCommand = new client_s3_1.ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: options?.prefix,
                MaxKeys: options?.maxKeys,
                StartAfter: options?.startAfter,
            });
            const response = await this.s3Client.send(listCommand);
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
    async getFileUrl(bucketName, filePath, options) {
        this.validateStringParam(bucketName, 'bucketName');
        this.validateStringParam(filePath, 'filePath');
        return this.handleProviderOperation('getFileUrl', async () => {
            if (options?.public) {
                // Construct public URL directly for S3
                // This assumes the bucket is configured for public access
                const region = await this.s3Client.config.region();
                return `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
            }
            else {
                // Generate a signed URL
                const getCommand = new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: filePath,
                });
                const expiresInSeconds = options?.expiresInSeconds || 3600; // Default to 1 hour
                return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, getCommand, {
                    expiresIn: expiresInSeconds,
                });
            }
        });
    }
    async getFileMetadata(bucketName, filePath) {
        this.validateStringParam(bucketName, 'bucketName');
        this.validateStringParam(filePath, 'filePath');
        return this.handleProviderOperation('getFileMetadata', async () => {
            const headCommand = new client_s3_1.HeadObjectCommand({
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
            }
            catch (error) {
                if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                    throw new errors_1.FileNotFoundError(`File not found: ${filePath} in bucket ${bucketName}`, { message: error.message, code: 'NoSuchKey' });
                }
                throw error; // Re-throw other errors for handleProviderOperation to catch
            }
        });
    }
}
exports.AwsS3Adapter = AwsS3Adapter;
//# sourceMappingURL=AwsS3Adapter.js.map