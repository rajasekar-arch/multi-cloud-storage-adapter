import { S3ClientConfig } from "@aws-sdk/client-s3";

export interface AwsS3Config extends S3ClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  defaultBucket?: string;
  // Any AWS S3 specific configurations not covered by S3ClientConfig
  // e.g., default region, IAM role information, etc.
}