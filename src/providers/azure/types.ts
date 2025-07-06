// src/providers/azure/types.ts

// Use ServiceClientOptions from @azure/core-client for general client options
// This is a more stable and commonly exported base options type.
import { ServiceClientOptions } from '@azure/core-client'; // Changed from @azure/core-rest-pipeline

// Define a type for your specific Azure Blob configuration
export interface AzureBlobConfig extends ServiceClientOptions { // Changed interface extension
  connectionString?: string;
  accountName?: string;
  accountKey?: string;
  options?: any;
  // Add any other Azure-specific configurations relevant to your use case
}

