"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcsAdapter = void 0;
const storage_1 = require("@google-cloud/storage");
const UniversalCloudStorageAdapter_1 = require("../../adapters/UniversalCloudStorageAdapter");
const errors_1 = require("../../types/errors");
class GcsAdapter extends UniversalCloudStorageAdapter_1.UniversalCloudStorageAdapter {
    storage;
    constructor(config) {
        super();
        try {
            this.storage = new storage_1.Storage(config);
        }
        catch (error) {
            throw new errors_1.ProviderInitializationError("Failed to initialize Google Cloud Storage client.", { message: error.message, providerError: error });
        }
    }
    getBucket(bucketName) {
        this.validateStringParam(bucketName, "bucketName");
        return this.storage.bucket(bucketName);
    }
    getFile(bucketName, filePath) {
        this.validateStringParam(filePath, "filePath");
        return this.getBucket(bucketName).file(filePath);
    }
    async uploadFile(bucketName, filePath, content, options) {
        return this.handleProviderOperation("uploadFile", async () => {
            const file = this.getFile(bucketName, filePath);
            const stream = typeof content === "string" ? Buffer.from(content) : content;
            await file.save(stream, {
                contentType: options?.contentType,
                public: options?.isPublic,
                metadata: options?.metadata,
            });
            const [metadata] = await file.getMetadata();
            return {
                fileName: file.name.split("/").pop() || "",
                filePath: file.name,
                fileSize: parseInt(metadata.size, 10),
                contentType: metadata.contentType,
                lastModified: new Date(metadata.updated),
                eTag: metadata.etag,
                url: options?.isPublic ? metadata.mediaLink : undefined,
            };
        });
    }
    async downloadFile(bucketName, filePath, options) {
        return this.handleProviderOperation("downloadFile", async () => {
            const file = this.getFile(bucketName, filePath);
            const [buffer] = await file.download(options);
            return buffer;
        });
    }
    async deleteFile(bucketName, filePath) {
        return this.handleProviderOperation("deleteFile", async () => {
            await this.getFile(bucketName, filePath).delete();
        });
    }
    async listFiles(bucketName, options) {
        return this.handleProviderOperation("listFiles", async () => {
            const [files] = await this.getBucket(bucketName).getFiles({
                prefix: options?.prefix,
                maxResults: options?.maxKeys,
                // GCS uses `pageToken` for pagination, not `startAfter`. Requires mapping.
                // autoPaginate: true, // GCS client handles pagination
            });
            return files.map((file) => ({
                fileName: file.name.split("/").pop() || "",
                filePath: file.name,
                fileSize: parseInt(file.metadata.size, 10),
                contentType: file.metadata.contentType,
                lastModified: new Date(file.metadata.updated),
                eTag: file.metadata.etag,
                url: file.metadata.mediaLink,
            }));
        });
    }
    async getFileUrl(bucketName, filePath, options) {
        return this.handleProviderOperation("getFileUrl", async () => {
            const file = this.getFile(bucketName, filePath);
            if (options?.public) {
                // GCS public URL pattern
                const [metadata] = await file.getMetadata();
                return metadata.mediaLink ? metadata.mediaLink : "";
            }
            else {
                const [url] = await file.getSignedUrl({
                    action: "read",
                    expires: Date.now() + (options?.expiresInSeconds || 3600) * 1000, // Convert seconds to milliseconds
                });
                return url ? url : "";
            }
        });
    }
    async getFileMetadata(bucketName, filePath) {
        return this.handleProviderOperation("getFileMetadata", async () => {
            const [metadata] = await this.getFile(bucketName, filePath).getMetadata();
            return {
                fileName: filePath.split("/").pop() || "",
                filePath: filePath,
                fileSize: parseInt(metadata.size, 10),
                contentType: metadata.contentType,
                lastModified: new Date(metadata.updated),
                eTag: metadata.etag,
                url: metadata.mediaLink, // GCS provides mediaLink for all files
            };
        });
    }
}
exports.GcsAdapter = GcsAdapter;
//# sourceMappingURL=GcsAdapter.js.map