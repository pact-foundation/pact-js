# Multipart Example

This example demonstrates contract testing for file upload endpoints that use `multipart/form-data` encoding.

## What You'll Learn

- Using `builder.multipartBody()` to define a file upload interaction
- How Pact handles multipart content type and boundary headers automatically
- Testing file upload endpoints without coupling to specific file contents

## Running the Example

```bash
npm install
npm test
```

## How It Works

**Consumer** uses `FormData` to build a multipart request and `axios.post()` to send it. The Pact interaction uses `builder.multipartBody(contentType, filePath, fieldName)` which reads the file and sets up the correct `Content-Type: multipart/form-data; boundary=...` header automatically.

**Provider** uses `multer` to parse incoming multipart requests. The field name in `upload.single('file')` must match the `fieldName` passed to `builder.multipartBody()` — this is the part of the contract that ensures the consumer and provider agree on the field name.

The contract does not capture file contents — only that a file of the specified content type was sent in the expected field. This is intentional: contract tests verify integration, not file processing logic.
