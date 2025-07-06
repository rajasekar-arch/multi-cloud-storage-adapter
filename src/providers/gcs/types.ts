import { StorageOptions } from '@google-cloud/storage';

export interface GcsConfig extends StorageOptions {
  // Google Cloud Storage specific configurations
  projectId: string;
  // Other specific settings
}