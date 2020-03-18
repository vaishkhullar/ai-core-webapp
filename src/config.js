export default {
  s3: {
    REGION: "YOUR_S3_UPLOADS_BUCKET_REGION",
    BUCKET: "YOUR_S3_UPLOADS_BUCKET_NAME"
  },
  apiGateway: {
    REGION: "eu-west-2",
    URL: "https://.execute-api.eu-west-2.amazonaws.com/prod"
  },
  cognito: {
    REGION: "eu-west-2",
    USER_POOL_ID: "",
    APP_CLIENT_ID: "",
    IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID"
  }
};