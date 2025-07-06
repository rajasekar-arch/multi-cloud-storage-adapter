import { S3ClientConfig } from "@aws-sdk/client-s3";
export interface AwsS3Config extends S3ClientConfig {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    defaultBucket?: string;
}
