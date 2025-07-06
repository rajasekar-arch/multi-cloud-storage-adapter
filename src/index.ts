export * from "./adapters/ICloudStorageAdapter";
export * from "./adapters/UniversalCloudStorageAdapter";
export * from "./providers";
export * from "./types/common";
export * from "./types/errors";

// A factory function could be added for convenience, although direct instantiation is also clear.
import { AwsS3Adapter } from "./providers/aws/AwsS3Adapter";
import { GcsAdapter } from "./providers/gcs/GcsAdapter";
import { AzureBlobAdapter } from "./providers/azure/AzureBlobAdapter";
import { DigitalOceanSpacesAdapter } from "./providers/digitalocean/DigitalOceanSpacesAdapter";
import { ICloudStorageAdapter } from "./adapters/ICloudStorageAdapter";
import { ProviderInitializationError } from "./types/errors";
import {
  AwsS3Config,
  AzureBlobConfig,
  DigitalOceanSpacesConfig,
  GcsConfig,
} from "./providers";

export type CloudProviderType = "aws" | "gcs" | "azure" | "digitalocean";

export type CloudProviderConfiguration =
  | { provider: "aws"; config: AwsS3Config }
  | { provider: "gcs"; config: GcsConfig }
  | { provider: "azure"; config: AzureBlobConfig }
  | { provider: "digitalocean"; config: DigitalOceanSpacesConfig };
// Add more provider types as they are added

/**
 * Factory function to create a cloud storage adapter instance.
 * @param providerConfig Configuration object for the desired provider.
 * @returns An instance of ICloudStorageAdapter.
 * @throws {ProviderInitializationError} if the provider type is unknown or configuration is invalid.
 */
export function createCloudStorageAdapter(
  providerConfig: CloudProviderConfiguration
): ICloudStorageAdapter {
  switch (providerConfig.provider) {
    case "aws":
      return new AwsS3Adapter(providerConfig.config);
    case "gcs":
      return new GcsAdapter(providerConfig.config);
    case "azure":
      return new AzureBlobAdapter(providerConfig.config);
    case "digitalocean":
      return new DigitalOceanSpacesAdapter(providerConfig.config);
    default:
      throw new ProviderInitializationError(
        `Unknown cloud provider: ${(providerConfig as any).provider}`,
        {
          message: `Invalid provider type: ${(providerConfig as any).provider}`,
        }
      );
  }
}
