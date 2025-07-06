import { Storage, Bucket, File } from "@google-cloud/storage";
import { UniversalCloudStorageAdapter } from "../../adapters/UniversalCloudStorageAdapter";
import {
  FileContent,
  FileMetadata,
  UploadOptions,
  DownloadOptions,
  ListFilesOptions,
  GetFileUrlOptions,
} from "../../types/common";
import { GcsConfig } from "./types";
import { ProviderInitializationError } from "../../types/errors";

export class GcsAdapter extends UniversalCloudStorageAdapter {
  private storage: Storage;

  constructor(config: GcsConfig) {
    super();
    try {
      this.storage = new Storage(config);
    } catch (error: any) {
      throw new ProviderInitializationError(
        "Failed to initialize Google Cloud Storage client.",
        { message: error.message, providerError: error }
      );
    }
  }

  private getBucket(bucketName: string): Bucket {
    this.validateStringParam(bucketName, "bucketName");
    return this.storage.bucket(bucketName);
  }

  private getFile(bucketName: string, filePath: string): File {
    this.validateStringParam(filePath, "filePath");
    return this.getBucket(bucketName).file(filePath);
  }

  public async uploadFile(
    bucketName: string,
    filePath: string,
    content: FileContent,
    options?: UploadOptions
  ): Promise<FileMetadata> {
    return this.handleProviderOperation("uploadFile", async () => {
      const file = this.getFile(bucketName, filePath);
      const stream =
        typeof content === "string" ? Buffer.from(content) : content;

      await file.save(stream as Buffer | ReadableStream, {
        contentType: options?.contentType,
        public: options?.isPublic,
        metadata: options?.metadata,
      });

      const [metadata]: any = await file.getMetadata();
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

  public async downloadFile(
    bucketName: string,
    filePath: string,
    options?: DownloadOptions | undefined
  ): Promise<Buffer> {
    return this.handleProviderOperation("downloadFile", async () => {
      const file = this.getFile(bucketName, filePath);
      const [buffer] = await file.download(
        options as import("@google-cloud/storage").DownloadOptions
      );
      return buffer;
    });
  }

  public async deleteFile(bucketName: string, filePath: string): Promise<void> {
    return this.handleProviderOperation("deleteFile", async () => {
      await this.getFile(bucketName, filePath).delete();
    });
  }

  public async listFiles(
    bucketName: string,
    options?: ListFilesOptions
  ): Promise<FileMetadata[]> {
    return this.handleProviderOperation("listFiles", async () => {
      const [files] = await this.getBucket(bucketName).getFiles({
        prefix: options?.prefix,
        maxResults: options?.maxKeys,
        // GCS uses `pageToken` for pagination, not `startAfter`. Requires mapping.
        // autoPaginate: true, // GCS client handles pagination
      });

      return files.map((file: any) => ({
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

  public async getFileUrl(
    bucketName: string,
    filePath: string,
    options?: GetFileUrlOptions
  ): Promise<string> {
    return this.handleProviderOperation("getFileUrl", async () => {
      const file = this.getFile(bucketName, filePath);
      if (options?.public) {
        // GCS public URL pattern
        const [metadata] = await file.getMetadata();
        return metadata.mediaLink ? metadata.mediaLink : "";
      } else {
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + (options?.expiresInSeconds || 3600) * 1000, // Convert seconds to milliseconds
        });
        return url ? url : "";
      }
    });
  }

  public async getFileMetadata(
    bucketName: string,
    filePath: string
  ): Promise<FileMetadata> {
    return this.handleProviderOperation("getFileMetadata", async () => {
      const [metadata]: any = await this.getFile(
        bucketName,
        filePath
      ).getMetadata();
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
