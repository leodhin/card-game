const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    const result = await s3.send(new ListBucketsCommand({}));
    console.log("Successfully connected. Buckets:", result.Buckets);
  } catch (error) {
    console.error("Error connecting to R2 endpoint:", error);
  }
}

testConnection();

module.exports = s3;