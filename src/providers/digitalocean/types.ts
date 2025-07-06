import { S3ClientConfig } from '@aws-sdk/client-s3'; // DigitalOcean Spaces is S3-compatible

export interface DigitalOceanSpacesConfig extends S3ClientConfig {
  // DigitalOcean Spaces specific configurations, extends S3 config
  endpoint: string; // e.g., 'https://nyc3.digitaloceanspaces.com'
  accessKeyId: string;
  secretAccessKey: string;
  region: string; // e.g., 'nyc3'
}