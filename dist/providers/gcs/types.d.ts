import { StorageOptions } from '@google-cloud/storage';
export interface GcsConfig extends StorageOptions {
    projectId: string;
}
