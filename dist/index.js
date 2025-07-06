"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCloudStorageAdapter = createCloudStorageAdapter;
__exportStar(require("./adapters/ICloudStorageAdapter"), exports);
__exportStar(require("./adapters/UniversalCloudStorageAdapter"), exports);
__exportStar(require("./providers"), exports);
__exportStar(require("./types/common"), exports);
__exportStar(require("./types/errors"), exports);
// A factory function could be added for convenience, although direct instantiation is also clear.
const AwsS3Adapter_1 = require("./providers/aws/AwsS3Adapter");
const GcsAdapter_1 = require("./providers/gcs/GcsAdapter");
const AzureBlobAdapter_1 = require("./providers/azure/AzureBlobAdapter");
const DigitalOceanSpacesAdapter_1 = require("./providers/digitalocean/DigitalOceanSpacesAdapter");
const errors_1 = require("./types/errors");
// Add more provider types as they are added
/**
 * Factory function to create a cloud storage adapter instance.
 * @param providerConfig Configuration object for the desired provider.
 * @returns An instance of ICloudStorageAdapter.
 * @throws {ProviderInitializationError} if the provider type is unknown or configuration is invalid.
 */
function createCloudStorageAdapter(providerConfig) {
    switch (providerConfig.provider) {
        case "aws":
            return new AwsS3Adapter_1.AwsS3Adapter(providerConfig.config);
        case "gcs":
            return new GcsAdapter_1.GcsAdapter(providerConfig.config);
        case "azure":
            return new AzureBlobAdapter_1.AzureBlobAdapter(providerConfig.config);
        case "digitalocean":
            return new DigitalOceanSpacesAdapter_1.DigitalOceanSpacesAdapter(providerConfig.config);
        default:
            throw new errors_1.ProviderInitializationError(`Unknown cloud provider: ${providerConfig.provider}`, {
                message: `Invalid provider type: ${providerConfig.provider}`,
            });
    }
}
//# sourceMappingURL=index.js.map