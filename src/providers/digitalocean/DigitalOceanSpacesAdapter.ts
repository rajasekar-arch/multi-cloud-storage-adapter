// DigitalOcean Spaces is S3-compatible, so we can largely reuse the AWS S3 adapter.
// We just need to ensure the endpoint and credentials are correctly passed.

import { AwsS3Adapter } from '../aws/AwsS3Adapter';
import { DigitalOceanSpacesConfig } from './types';
import { ProviderInitializationError } from '../../types/errors';

export class DigitalOceanSpacesAdapter extends AwsS3Adapter {
  constructor(config: DigitalOceanSpacesConfig) {
    // DigitalOcean Spaces uses the S3 SDK, but requires a specific endpoint.
    // The AwsS3Adapter constructor directly takes S3ClientConfig, which is compatible.
    // Ensure the endpoint is correctly passed in the config.
    super({
      ...config,
      endpoint: config.endpoint, // Override default AWS endpoint
      region: config.region,     // DigitalOcean regions
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Often required for S3-compatible storage like DO Spaces
    });

    if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.region) {
      throw new ProviderInitializationError(
        'DigitalOcean Spaces configuration requires endpoint, accessKeyId, secretAccessKey, and region.',
        { message: 'Invalid DigitalOcean Spaces configuration' }
      );
    }
  }

  // All methods from AwsS3Adapter are inherited and should work directly,
  // as DigitalOcean Spaces implements the S3 API.
  // If there are any specific nuances, they can be overridden here.
}

