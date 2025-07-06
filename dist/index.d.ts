export * from "./adapters/ICloudStorageAdapter";
export * from "./adapters/UniversalCloudStorageAdapter";
export * from "./providers";
export * from "./types/common";
export * from "./types/errors";
import { ICloudStorageAdapter } from "./adapters/ICloudStorageAdapter";
import { AwsS3Config, AzureBlobConfig, DigitalOceanSpacesConfig, GcsConfig } from "./providers";
export type CloudProviderType = "aws" | "gcs" | "azure" | "digitalocean";
export type CloudProviderConfiguration = {
    provider: "aws";
    config: AwsS3Config;
} | {
    provider: "gcs";
    config: GcsConfig;
} | {
    provider: "azure";
    config: AzureBlobConfig;
} | {
    provider: "digitalocean";
    config: DigitalOceanSpacesConfig;
};
/**
 * Factory function to create a cloud storage adapter instance.
 * @param providerConfig Configuration object for the desired provider.
 * @returns An instance of ICloudStorageAdapter.
 * @throws {ProviderInitializationError} if the provider type is unknown or configuration is invalid.
 */
export declare function createCloudStorageAdapter(providerConfig: CloudProviderConfiguration): ICloudStorageAdapter;
