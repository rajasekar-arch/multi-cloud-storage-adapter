"use strict";
// DigitalOcean Spaces is S3-compatible, so we can largely reuse the AWS S3 adapter.
// We just need to ensure the endpoint and credentials are correctly passed.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalOceanSpacesAdapter = void 0;
const AwsS3Adapter_1 = require("../aws/AwsS3Adapter");
const errors_1 = require("../../types/errors");
class DigitalOceanSpacesAdapter extends AwsS3Adapter_1.AwsS3Adapter {
    constructor(config) {
        // DigitalOcean Spaces uses the S3 SDK, but requires a specific endpoint.
        // The AwsS3Adapter constructor directly takes S3ClientConfig, which is compatible.
        // Ensure the endpoint is correctly passed in the config.
        super({
            ...config,
            endpoint: config.endpoint, // Override default AWS endpoint
            region: config.region, // DigitalOcean regions
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            forcePathStyle: true, // Often required for S3-compatible storage like DO Spaces
        });
        if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.region) {
            throw new errors_1.ProviderInitializationError('DigitalOcean Spaces configuration requires endpoint, accessKeyId, secretAccessKey, and region.', { message: 'Invalid DigitalOcean Spaces configuration' });
        }
    }
}
exports.DigitalOceanSpacesAdapter = DigitalOceanSpacesAdapter;
//# sourceMappingURL=DigitalOceanSpacesAdapter.js.map