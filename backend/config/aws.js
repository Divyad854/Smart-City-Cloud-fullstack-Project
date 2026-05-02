const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const { SNSClient } = require("@aws-sdk/client-sns");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");

require("dotenv").config();

const awsConfig = {
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const dynamoClient = new DynamoDBClient(awsConfig);
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const s3Client = new S3Client(awsConfig);
const rekognitionClient = new RekognitionClient(awsConfig);
const snsClient = new SNSClient(awsConfig);
const sqsClient = new SQSClient(awsConfig);
const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

module.exports = {
  dynamoDB,
  s3Client,
  rekognitionClient,
  snsClient,
  sqsClient,
  cognitoClient,
};
