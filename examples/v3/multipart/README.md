# Pact JS V3 Multipart Form Data Example

This example demonstrates how to use Pact JS V3 with multipart/form-data requests, which are commonly used for file uploads and forms that include both text and binary data.

## Overview

Multipart/form-data is an encoding type that allows files and data to be sent in HTTP requests. This example shows various scenarios including:

- Text field submissions in multipart forms
- Binary file uploads (images, text files)
- Multiple file uploads in a single request
- Custom boundary strings for multipart data
- Using helper methods for simplified setup

## Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn package manager
- Basic understanding of Pact consumer-driven contract testing

## Installation

```bash
npm install
```

## Running the Tests

```bash
# Run the consumer tests
npm run test:consumer
```

## Test Cases Explained

**File**: [consumer.spec.ts](consumer.spec.ts)

### Test 1: Simple Text Field in Multipart Form

**Purpose**: Demonstrates the basic use case of sending a single text field in a multipart/form-data request.

**Key Points**:

- Uses `FormData.append()` to add text fields
- `FormData.getHeaders()` automatically generates the Content-Type header with a unique boundary
- The boundary is essential for parsing multipart messages

**Use Case**: Forms that may optionally include files but sometimes only have text fields.

```typescript
const formData = new FormData();
formData.append('name', 'John Doe');
const headers = formData.getHeaders();
```

### Test 2: JPG Image File Upload

**Purpose**: Demonstrates uploading a binary file (JPG image) using multipart form data.

**Key Points**:

- Uses `withRequestMultipartFileUpload()` helper method for simplified setup
- Helper abstracts away boundary creation and multipart formatting
- Accepts parameters: request config, content type, file path, and form field name

**Use Case**: Profile photo uploads, product images, document scanning.

```typescript
await pact
  .withRequestMultipartFileUpload(
    { method: 'POST', path: '/upload-image' },
    'image/jpeg',
    imageFilePath,
    'photo'
  )
```

### Test 3: Manual Multipart File Upload Setup

**Purpose**: Shows the manual approach without using helper methods, giving full control over request structure.

**When to Use**:

- You need fine-grained control over the request structure
- Testing edge cases or specific multipart formatting
- Custom headers or specialized multipart requirements

**Key Points**:

- Manually create and format the FormData
- Explicitly convert to string buffer (doesn't work for binary data)
- Direct control over all headers

```typescript
const formData = new FormData();
const fileContent = fs.readFileSync(tmpFile);
formData.append('document', fileContent, 'test-file.txt');
const form = formData.getBuffer().toString();
```

### Test 4: Using withRequestMultipartFileUpload Helper

**Purpose**: Demonstrates the recommended approach for most multipart file upload scenarios.

**Advantages**:

- Less boilerplate code
- Automatic boundary generation
- Reduced chance of errors
- Clearer intent

### Test 5: Custom Boundary String

**Purpose**: Demonstrates using a custom boundary string instead of an auto-generated one.

**Why Use Custom Boundaries?**:

- Testing specific edge cases or provider requirements
- Debugging multipart parsing issues
- Making tests more deterministic

**Important Requirements**:

- Boundary must not appear in the actual content
- Must be the same in both Content-Type header and request body
- Format: `multipart/form-data; boundary=YourBoundaryHere`

```typescript
const customBoundary = 'MyCustomBoundary123456789';
headers['content-type'] = `multipart/form-data; boundary=${customBoundary}`;
```

### Test 6: Multiple File Uploads

**Purpose**: Demonstrates uploading multiple files of different types in a single request.

**Key Concepts**:

- Chain multiple `withRequestMultipartFileUpload()` calls
- Each file can have a different content type
- Each file has its own field name
- Order matters - match setup order in actual request

**Real-World Use Cases**:

- Profile updates with photo and resume
- Document submission with multiple attachments
- Media galleries with mixed content types
- Form submissions with supporting documents

```typescript
await pact
  .withRequestMultipartFileUpload({ method: 'POST', path: '/upload' }, 'image/jpeg', imagePath, 'photo')
  .withRequestMultipartFileUpload({ method: 'POST', path: '/upload' }, 'text/plain', textPath, 'file')
```
