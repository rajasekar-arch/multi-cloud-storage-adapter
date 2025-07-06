import { createCloudStorageAdapter, CloudProviderType, UploadOptions, FileNotFoundError, OperationFailedError } from 'multi=cloud-storage-adapter';
import * as path from 'path';
import * as fs from 'fs';

async function runCloudOperations() {
  try {
    // --- AWS S3 Example ---
    const awsS3Adapter = createCloudStorageAdapter({
      provider: 'aws',
      config: {
        region: 'ap-south-1', // e.g., 'us-east-1'
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      },
    });

    const awsBucket = 'my-unique-aws-bucket-123';
    const awsFilePath = 'documents/report.pdf';
    const localFilePath = path.join(__dirname, 'test-file.txt'); // Create a dummy file
    fs.writeFileSync(localFilePath, 'This is a test file for cloud storage.');

    console.log('--- AWS S3 Operations ---');
    console.log(`Uploading ${localFilePath} to ${awsBucket}/${awsFilePath}...`);
    const uploadResult = await awsS3Adapter.uploadFile(
      awsBucket,
      awsFilePath,
      fs.readFileSync(localFilePath),
      {
        contentType: 'text/plain',
        isPublic: false,
        metadata: { project: 'cloud-adapter', env: 'dev' }
      }
    );
    console.log('Upload successful:', uploadResult);

    console.log(`Downloading ${awsBucket}/${awsFilePath}...`);
    const downloadedContent = await awsS3Adapter.downloadFile(awsBucket, awsFilePath);
    console.log('Downloaded content:', downloadedContent.toString());

    console.log(`Getting URL for ${awsBucket}/${awsFilePath}...`);
    const signedUrl = await awsS3Adapter.getFileUrl(awsBucket, awsFilePath, { expiresInSeconds: 60 });
    console.log('Signed URL:', signedUrl);

    console.log(`Listing files in ${awsBucket}...`);
    const files = await awsS3Adapter.listFiles(awsBucket, { prefix: 'documents/' });
    console.log('Files in bucket:', files.map(f => f.filePath));

    console.log(`Getting metadata for ${awsBucket}/${awsFilePath}...`);
    const metadata = await awsS3Adapter.getFileMetadata(awsBucket, awsFilePath);
    console.log('File Metadata:', metadata);

    // console.log(`Deleting ${awsBucket}/${awsFilePath}...`);
    // await awsS3Adapter.deleteFile(awsBucket, awsFilePath);
    // console.log('File deleted successfully.');

    fs.unlinkSync(localFilePath); // Clean up dummy file

    // --- Google Cloud Storage Example ---
    const gcsAdapter = createCloudStorageAdapter({
      provider: 'gcs',
      config: {
        projectId: process.env.GCP_PROJECT_ID || '',
        keyFilename: process.env.GCP_KEY_FILE_PATH || '', // Path to your service account key file
      },
    });

    const gcsBucket = 'my-unique-gcs-bucket-123';
    const gcsFilePath = 'data/analytics/sales.csv';
    const gcsLocalFilePath = path.join(__dirname, 'gcs-test-file.txt');
    fs.writeFileSync(gcsLocalFilePath, 'Col1,Col2\nVal1,Val2');

    console.log('\n--- Google Cloud Storage Operations ---');
    console.log(`Uploading ${gcsLocalFilePath} to ${gcsBucket}/${gcsFilePath}...`);
    await gcsAdapter.uploadFile(
      gcsBucket,
      gcsFilePath,
      fs.createReadStream(gcsLocalFilePath), // Example with stream
      { contentType: 'text/csv' }
    );
    console.log('GCS Upload successful.');

    console.log(`Downloading ${gcsBucket}/${gcsFilePath}...`);
    const gcsDownloadedContent = await gcsAdapter.downloadFile(gcsBucket, gcsFilePath);
    console.log('GCS Downloaded content length:', gcsDownloadedContent.length);

    console.log(`Getting public URL for ${gcsBucket}/${gcsFilePath} (if configured for public access)...`);
    // Note: For public URL to work, the GCS bucket/object must be publicly accessible.
    const gcsPublicUrl = await gcsAdapter.getFileUrl(gcsBucket, gcsFilePath, { public: true });
    console.log('GCS Public URL:', gcsPublicUrl);

    // console.log(`Deleting ${gcsBucket}/${gcsFilePath}...`);
    // await gcsAdapter.deleteFile(gcsBucket, gcsFilePath);
    // console.log('GCS File deleted successfully.');

    fs.unlinkSync(gcsLocalFilePath); // Clean up dummy file

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

// Ensure you have your environment variables set for AWS and GCP credentials
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
// GCP_PROJECT_ID, GCP_KEY_FILE_PATH
runCloudOperations();