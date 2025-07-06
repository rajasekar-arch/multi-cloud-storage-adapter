import { ServiceClientOptions } from '@azure/core-client';
export interface AzureBlobConfig extends ServiceClientOptions {
    connectionString?: string;
    accountName?: string;
    accountKey?: string;
    options?: any;
}
