# **Multi Cloud Storage Adapter**

A TypeScript-first npm package that provides a single, unified, and strongly-typed API for common file storage operations across various cloud providers like AWS S3, Google Cloud Storage, Azure Blob Storage, and DigitalOcean Spaces.

## **🌟 Why Use This Package?**

Developers often work with multiple cloud storage providers, leading to a fragmented experience and increased complexity. This package simplifies multi-cloud strategies, makes it easier to switch providers, and significantly reduces boilerplate code for file management by offering:

* **Unified API:** A consistent interface for all supported cloud storage services.  
* **Strong Type Safety:** Leverages TypeScript to ensure type safety for file metadata, bucket names, and operation results, minimizing runtime errors.  
* **Reduced Boilerplate:** Abstract away provider-specific SDK complexities.  
* **Simplified Multi-Cloud:** Seamlessly integrate and manage files across different cloud environments.

## **✨ Features**

* `uploadFile(bucketName, filePath, content, options)`: Uploads a file.  
* `downloadFile(bucketName, filePath, options)`: Downloads a file.  
* `deleteFile(bucketName, filePath)`: Deletes a file.  
* `listFiles(bucketName, options)`: Lists files within a bucket.  
* `getFileUrl(bucketName, filePath, options)`: Retrieves a public or signed URL for a file.  
* `getFileMetadata(bucketName, filePath)`: Fetches detailed metadata for a file.

## **🚀 Installation**

Install the package and its peer dependencies for the cloud providers you intend to use:

npm install universal-cloud-storage @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @google-cloud/storage @azure/storage-blob @azure/core-client  
\# For DigitalOcean Spaces, you'll implicitly use @aws-sdk/client-s3

## **📚 Usage**

First, ensure you have your cloud provider credentials set as environment variables or configured appropriately.

import { createCloudStorageAdapter, FileNotFoundError, OperationFailedError } from 'universal-cloud-storage';  
import \* as path from 'path';  
import \* as fs from 'fs';

async function runCloudOperations() {  
  try {  
    // \--- AWS S3 Example \---  
    const awsS3Adapter \= createCloudStorageAdapter({  
      provider: 'aws',  
      config: {  
        region: process.env.AWS\_REGION || 'us-east-1', // Ensure your region is set  
        credentials: {  
          accessKeyId: process.env.AWS\_ACCESS\_KEY\_ID || '',  
          secretAccessKey: process.env.AWS\_SECRET\_ACCESS\_KEY || '',  
        },  
        // You can optionally set a default bucket here if your adapter uses it  
        // defaultBucket: 'my-default-aws-bucket',  
      },  
    });

    const awsBucket \= 'your-aws-bucket-name'; // Replace with your actual AWS S3 bucket name  
    const awsFilePath \= 'documents/example-aws.txt';  
    const localFilePath \= path.join(\_\_dirname, 'temp-aws-file.txt');  
    fs.writeFileSync(localFilePath, 'Hello from AWS S3 via Universal Adapter\!');

    console.log('--- AWS S3 Operations \---');  
    console.log(\`Uploading ${localFilePath} to ${awsBucket}/${awsFilePath}...\`);  
    const awsUploadResult \= await awsS3Adapter.uploadFile(  
      awsBucket,  
      awsFilePath,  
      fs.readFileSync(localFilePath),  
      {  
        contentType: 'text/plain',  
        isPublic: false,  
        metadata: { source: 'universal-adapter' }  
      }  
    );  
    console.log('AWS Upload successful:', awsUploadResult.filePath);

    console.log(\`Downloading ${awsBucket}/${awsFilePath}...\`);  
    const awsDownloadedContent \= await awsS3Adapter.downloadFile(awsBucket, awsFilePath);  
    console.log('AWS Downloaded content:', awsDownloadedContent.toString());

    console.log(\`Getting signed URL for ${awsBucket}/${awsFilePath}...\`);  
    const awsSignedUrl \= await awsS3Adapter.getFileUrl(awsBucket, awsFilePath, { expiresInSeconds: 300 });  
    console.log('AWS Signed URL:', awsSignedUrl);

    console.log(\`Listing files in ${awsBucket} with prefix 'documents/'...\`);  
    const awsFiles \= await awsS3Adapter.listFiles(awsBucket, { prefix: 'documents/' });  
    console.log('AWS Files found:', awsFiles.map(f \=\> f.filePath));

    console.log(\`Getting metadata for ${awsBucket}/${awsFilePath}...\`);  
    const awsMetadata \= await awsS3Adapter.getFileMetadata(awsBucket, awsFilePath);  
    console.log('AWS File Metadata:', awsMetadata);

    console.log(\`Deleting ${awsBucket}/${awsFilePath}...\`);  
    await awsS3Adapter.deleteFile(awsBucket, awsFilePath);  
    console.log('AWS File deleted successfully.');  
    fs.unlinkSync(localFilePath);

    // \--- Google Cloud Storage (GCS) Example \---  
    const gcsAdapter \= createCloudStorageAdapter({  
      provider: 'gcs',  
      config: {  
        projectId: process.env.GCP\_PROJECT\_ID || '',  
        keyFilename: process.env.GCP\_KEY\_FILE\_PATH || '', // Path to your service account key file  
      },  
    });

    const gcsBucket \= 'your-gcs-bucket-name'; // Replace with your actual GCS bucket name  
    const gcsFilePath \= 'reports/example-gcs.csv';  
    const gcsLocalFilePath \= path.join(\_\_dirname, 'temp-gcs-file.csv');  
    fs.writeFileSync(gcsLocalFilePath, 'id,name\\n1,Alice\\n2,Bob');

    console.log('\\n--- Google Cloud Storage Operations \---');  
    console.log(\`Uploading ${gcsLocalFilePath} to ${gcsBucket}/${gcsFilePath}...\`);  
    await gcsAdapter.uploadFile(  
      gcsBucket,  
      gcsFilePath,  
      fs.createReadStream(gcsLocalFilePath), // Example: upload using a stream  
      { contentType: 'text/csv' }  
    );  
    console.log('GCS Upload successful.');

    console.log(\`Downloading ${gcsBucket}/${gcsFilePath}...\`);  
    const gcsDownloadedContent \= await gcsAdapter.downloadFile(gcsBucket, gcsFilePath);  
    console.log('GCS Downloaded content:', gcsDownloadedContent.toString());

    console.log(\`Getting public URL for ${gcsBucket}/${gcsFilePath} (if publicly accessible)...\`);  
    // Note: For public URL to work, the GCS bucket/object must be configured for public access.  
    const gcsPublicUrl \= await gcsAdapter.getFileUrl(gcsBucket, gcsFilePath, { public: true });  
    console.log('GCS Public URL:', gcsPublicUrl);

    console.log(\`Deleting ${gcsBucket}/${gcsFilePath}...\`);  
    await gcsAdapter.deleteFile(gcsBucket, gcsFilePath);  
    console.log('GCS File deleted successfully.');  
    fs.unlinkSync(gcsLocalFilePath);

    // \--- Azure Blob Storage Example \---  
    const azureAdapter \= createCloudStorageAdapter({  
      provider: 'azure',  
      config: {  
        connectionString: process.env.AZURE\_STORAGE\_CONNECTION\_STRING, // OR use accountName/accountKey  
        // accountName: process.env.AZURE\_STORAGE\_ACCOUNT\_NAME,  
        // accountKey: process.env.AZURE\_STORAGE\_ACCOUNT\_KEY,  
      },  
    });

    const azureContainer \= 'your-azure-container-name'; // Replace with your actual Azure container name  
    const azureFilePath \= 'logs/app-log.json';  
    const azureLocalFilePath \= path.join(\_\_dirname, 'temp-azure-log.json');  
    fs.writeFileSync(azureLocalFilePath, JSON.stringify({ timestamp: new Date().toISOString(), message: 'Azure test log' }));

    console.log('\\n--- Azure Blob Storage Operations \---');  
    console.log(\`Uploading ${azureLocalFilePath} to ${azureContainer}/${azureFilePath}...\`);  
    await azureAdapter.uploadFile(  
      azureContainer,  
      azureFilePath,  
      fs.readFileSync(azureLocalFilePath),  
      { contentType: 'application/json' }  
    );  
    console.log('Azure Upload successful.');

    console.log(\`Downloading ${azureContainer}/${azureFilePath}...\`);  
    const azureDownloadedContent \= await azureAdapter.downloadFile(azureContainer, azureFilePath);  
    console.log('Azure Downloaded content:', azureDownloadedContent.toString());

    console.log(\`Getting SAS URL for ${azureContainer}/${azureFilePath}...\`);  
    const azureSasUrl \= await azureAdapter.getFileUrl(azureContainer, azureFilePath, { expiresInSeconds: 300 });  
    console.log('Azure SAS URL:', azureSasUrl);

    console.log(\`Deleting ${azureContainer}/${azureFilePath}...\`);  
    await azureAdapter.deleteFile(azureContainer, azureFilePath);  
    console.log('Azure File deleted successfully.');  
    fs.unlinkSync(azureLocalFilePath);

    // \--- DigitalOcean Spaces Example \---  
    const doAdapter \= createCloudStorageAdapter({  
      provider: 'digitalocean',  
      config: {  
        endpoint: process.env.DO\_SPACES\_ENDPOINT || 'https://nyc3.digitaloceanspaces.com', // e.g., 'https://nyc3.digitaloceanspaces.com'  
        region: process.env.DO\_SPACES\_REGION || 'nyc3', // e.g., 'nyc3'  
        accessKeyId: process.env.DO\_SPACES\_ACCESS\_KEY\_ID || '',  
        secretAccessKey: process.env.DO\_SPACES\_SECRET\_ACCESS\_KEY || '',  
      },  
    });

    const doBucket \= 'your-do-space-name'; // Replace with your actual DigitalOcean Space name  
    const doFilePath \= 'misc/image.jpg';  
    const doLocalFilePath \= path.join(\_\_dirname, 'temp-do-image.txt'); // Using text for simplicity  
    fs.writeFileSync(doLocalFilePath, 'This is a dummy image content for DigitalOcean Spaces.');

    console.log('\\n--- DigitalOcean Spaces Operations \---');  
    console.log(\`Uploading ${doLocalFilePath} to ${doBucket}/${doFilePath}...\`);  
    await doAdapter.uploadFile(  
      doBucket,  
      doFilePath,  
      fs.readFileSync(doLocalFilePath),  
      { contentType: 'image/jpeg' }  
    );  
    console.log('DigitalOcean Spaces Upload successful.');

    console.log(\`Downloading ${doBucket}/${doFilePath}...\`);  
    const doDownloadedContent \= await doAdapter.downloadFile(doBucket, doFilePath);  
    console.log('DigitalOcean Spaces Downloaded content:', doDownloadedContent.toString());

    console.log(\`Deleting ${doBucket}/${doFilePath}...\`);  
    await doAdapter.deleteFile(doBucket, doFilePath);  
    console.log('DigitalOcean Spaces File deleted successfully.');  
    fs.unlinkSync(doLocalFilePath);

  } catch (error) {  
    if (error instanceof FileNotFoundError) {  
      console.error('File Not Found Error:', error.message);  
      console.error('Details:', error.details);  
    } else if (error instanceof OperationFailedError) {  
      console.error('Operation Failed Error:', error.message);  
      console.error('Details:', error.details);  
    } else {  
      console.error('An unexpected error occurred:', error);  
    }  
  }  
}

runCloudOperations();

## **🛠️ Configuration**

Each adapter requires specific configuration parameters, typically passed during initialization.

* **`AwsS3Config`**: Extends `@aws-sdk/client-s3`'s `S3ClientConfig`.  
  * `region`: AWS region (e.g., `'us-east-1'`).  
  * `credentials`: Object with `accessKeyId` and `secretAccessKey`.  
  * `defaultBucket?`: (Optional) A default bucket name for convenience.  
* **`GcsConfig`**: Extends `@google-cloud/storage`'s `StorageOptions`.  
  * `projectId`: Your Google Cloud Project ID.  
  * `keyFilename?`: (Optional) Path to your Google Service Account JSON key file.  
* **`AzureBlobConfig`**: Extends `@azure/storage-blob`'s `BlobClientOptions`.  
  * `connectionString?`: Azure Storage Account connection string.  
  * `accountName?`: Azure Storage Account name (if not using connection string).  
  * `accountKey?`: Azure Storage Account key (if not using connection string).  
  * *(Note: Either `connectionString` or both `accountName` and `accountKey` are required.)*  
* **`DigitalOceanSpacesConfig`**: Extends `@aws-sdk/client-s3`'s `S3ClientConfig` (as DO Spaces is S3-compatible).  
  * `endpoint`: The DigitalOcean Spaces endpoint (e.g., `'https://nyc3.digitaloceanspaces.com'`).  
  * `region`: The DigitalOcean region (e.g., `'nyc3'`).  
  * `accessKeyId`: Your DigitalOcean Spaces access key.  
  * `secretAccessKey`: Your DigitalOcean Spaces secret key.

## **🚨 Error Handling**

The package provides custom error classes for consistent error handling across providers:

* `UniversalCloudStorageError`: Base class for all package-specific errors.  
* `ProviderInitializationError`: Thrown if a cloud provider client fails to initialize (e.g., invalid credentials).  
* `FileNotFoundError`: Thrown when an attempted operation targets a non-existent file.  
* `OperationFailedError`: A general error for when a cloud operation fails for other reasons (e.g., permissions, network issues).  
* `InvalidArgumentError`: Thrown if required input parameters are missing or invalid.

All custom errors include a `details` property containing more specific information, including the original error from the underlying cloud SDK (`providerError`).

## **🤝 Contributing**

Contributions are welcome\! If you'd like to contribute, please follow these steps:

1. Fork the repository.  
2. Clone your forked repository.
3. Install dependencies: `npm install`  
4. Build the project: `npm run build`  
5. Run tests: `npm test`  
6. Create a new branch for your feature or bug fix.  
7. Make your changes, ensuring they adhere to the coding standards and include tests.  
8. Commit your changes and push to your fork.  
9. Open a pull request to the main repository.

## **📄 License**

This project is licensed under the MIT License \- see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

