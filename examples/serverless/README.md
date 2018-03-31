# Serverless example

Fictional application running using the [Serverless](https://github.com/serverless/serverless) framework.

**Message Producer**

Small utility that takes a request and publishes a message to an SQS queue.

**Message Consumer**

Lambda function that reads from SQS and processes the data.


## Deploy service

Ensure you have valid AWS credentials in your environment, and then run;

```sh
export AWS_ACCOUNT_ID=1234xxxx5678 # Required by function at runtime
serverless deploy -v
```

## How we set this up

```sh
npm install -g serverless
serverless create --template aws-nodejs --path sqs-publisher
```
