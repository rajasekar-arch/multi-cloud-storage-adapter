import { S3ClientConfig } from '@aws-sdk/client-s3';
export interface DigitalOceanSpacesConfig extends S3ClientConfig {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}
