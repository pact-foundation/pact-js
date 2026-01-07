# Pact JS V3 Multipart Form Data with Matching Rules Example

This example demonstrates how to use Pact JS V3 with matching rules for `multipart/form-data` requests. This is adapted from the [Pact Python multipart matching rules example](https://github.com/pact-foundation/pact-python/blob/main/examples/catalog/multipart_matching_rules/test_consumer.py) and shows how to combine multipart file uploads with flexible contract validation.

## Overview

When testing multipart form data uploads, you often need flexibility in the data being sent while still maintaining strict contract validation. Matching rules allow you to:

- Validate the structure and types of multipart parts without requiring exact values
- Match binary file content types (images, documents, etc.)
- Apply regex patterns and type matching to JSON metadata within multipart forms
- Test realistic upload scenarios with different data each time

This example demonstrates real-world file upload scenarios including:

- **File Upload Service**: JSON metadata with image uploads
- **User Profile Management**: Multiple file uploads (profile pictures and documents) with metadata

## Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn package manager
- Basic understanding of Pact consumer-driven contract testing
- Understanding of multipart/form-data format

## Installation

```bash
npm install
```

## Running the Tests

```bash
# Run only the multipart matching rules tests
npm run test:matching-rules

# Run the regular multipart tests
npm run test:consumer
```

## Test Cases Explained

**File**: [consumer-matching-rules.spec.ts](consumer-matching-rules.spec.ts)

### Test 1: Multipart Upload with JSON Metadata and Image

**Purpose**: Demonstrates uploading a file with JSON metadata using matching rules to validate structure rather than exact values.

**Key Points**:

- Uses a fixed boundary (`test-boundary-12345`) for consistent testing
- Manually constructs the multipart body with JSON and binary parts
- Defines matching rules for multipart body parts using JSON Path selectors
- `$.metadata` matches the JSON part with type matching
- `$.image` matches the binary part with content type matching
- FormData can be configured to use a fixed boundary

**Use Case**: Testing file upload APIs where metadata (file name, size) varies but structure must remain consistent.

**Example Data**:
- Metadata (contract): `{ name: "test", size: 100 }`
- Metadata (actual): `{ name: "different", size: 200 }`
- Image: Minimal JPEG bytes (magic bytes only)

```typescript
// Define matching rules for multipart body parts
const requestMatchingRules = {
  body: {
    // Match content type of the image part
    '$.image': {
      matchers: [
        {
          match: 'contentType',
          value: 'image/jpeg',
        },
      ],
    },
    // Match the metadata part as a type (any object)
    '$.metadata': {
      matchers: [{ match: 'type' }],
    },
    // Match the name field with a regex pattern (letters only)
    '$.metadata.name': {
      matchers: [
        {
          match: 'regex',
          regex: '^[a-zA-Z]+$',
        },
      ],
    },
    // Match the size field as an integer
    '$.metadata.size': {
      matchers: [{ match: 'integer' }],
    },
  },
};

await pact
  .given('file upload service is available')
  .uponReceiving('a multipart upload with JSON metadata and image')
  .withRequestMatchingRules(
    {
      method: 'POST',
      path: '/upload',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyBuffer.toString('binary'),
    },
    JSON.stringify(requestMatchingRules)
  )
  .willRespondWith({
    status: 201,
    body: {
      id: MatchersV3.like('upload-1'),
      message: MatchersV3.like('Upload successful'),
      metadata: {
        name: MatchersV3.like('test'),
        size: MatchersV3.integer(100),
      },
      image_size: MatchersV3.integer(JPEG_BYTES.length),
    },
  })
  .executeTest(async (mockServer) => {
    // Create FormData with fixed boundary
    const formData = new FormData();
    formData.getBoundary = () => boundary;

    // Send different data that still matches the rules
    formData.append(
      'metadata',
      JSON.stringify({ name: 'different', size: 200 }),
      { contentType: 'application/json' }
    );
    formData.append('image', JPEG_BYTES, {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post(`${mockServer.url}/upload`, formData, {
      headers: formData.getHeaders(),
    });
  });
```

**Why This Matters**: File upload APIs often receive varying metadata (different file names, sizes, descriptions) while maintaining the same structure. Matching rules allow testing the contract without hardcoding specific values.

### Test 2: Multiple File Uploads with Different Content Types

**Purpose**: Shows how to validate complex multipart scenarios with multiple files and comprehensive matching rules.

**Key Points**:

- Multiple file parts (profile picture and document) in a single request
- Different content types for different parts (image/jpeg, text/plain)
- JSON metadata with regex and integer matching
- Demonstrates a realistic user profile update scenario

**Use Case**: Testing user profile upload APIs where users can upload profile pictures and documents together with metadata.

**Example Data**:
- User ID: `user-12345` (matches `^user-[0-9]+$`)
- Upload Type: `profile-update` (matches enum: `profile-update|document-upload|bulk-import`)
- Timestamp: 1736250000000 (integer)
- Profile Picture: JPEG image
- Document: Plain text file

```typescript
const requestMatchingRules = {
  body: {
    // Metadata matching rules
    '$.metadata.userId': {
      matchers: [
        {
          match: 'regex',
          regex: '^user-[0-9]+$',
        },
      ],
    },
    '$.metadata.uploadType': {
      matchers: [
        {
          match: 'regex',
          regex: '^(profile-update|document-upload|bulk-import)$',
        },
      ],
    },
    '$.metadata.timestamp': {
      matchers: [{ match: 'integer' }],
    },
    // File part matching rules
    '$.profilePicture': {
      matchers: [
        {
          match: 'contentType',
          value: 'image/jpeg',
        },
      ],
    },
    '$.document': {
      matchers: [
        {
          match: 'contentType',
          value: 'text/plain',
        },
      ],
    },
  },
};
```

**Real-World Applications**:
- User profile management systems
- Document management platforms
- Multi-file upload workflows
- Content management systems

## Multipart Matching Rules Specification

### JSON Path Selectors for Multipart Bodies

When working with multipart/form-data, matching rules use special JSON Path selectors:

- `$.partName` - Selects an entire multipart part by its field name
- `$.partName.fieldName` - Selects a field within a JSON part
- `$.partName[*].field` - Selects fields in JSON arrays within a part

### Content Type Matching

The `contentType` matcher is specifically designed for multipart data:

```typescript
{
  match: 'contentType',
  value: 'image/jpeg'  // or 'text/plain', 'application/pdf', etc.
}
```

This matcher validates the `Content-Type` header of individual multipart parts.

### Fixed Boundaries

For consistent testing, use a fixed boundary string:

```typescript
const boundary = 'test-boundary-12345';

// Configure FormData to use the fixed boundary
const formData = new FormData();
formData.getBoundary = () => boundary;
```

**Why Fixed Boundaries?**
- Ensures consistent Pact contract files across test runs
- Makes test data predictable and reproducible
- Simplifies debugging and contract verification

## Differences from Python Example

This JavaScript/TypeScript example is adapted from the [Pact Python example](https://github.com/pact-foundation/pact-python/blob/main/examples/catalog/multipart_matching_rules/test_consumer.py) with some key differences:

1. **Boundary Management**: Uses `formData.getBoundary()` override instead of Python's approach
2. **Binary Data**: Uses Node.js `Buffer` for binary JPEG data
3. **HTTP Client**: Uses Axios instead of Python's httpx
4. **Type Safety**: TypeScript provides compile-time type checking

## Best Practices

1. **Use fixed boundaries for testing**: Override FormData's default random boundary
2. **Match content types for binary parts**: Use `contentType` matcher for images, PDFs, etc.
3. **Use regex for metadata validation**: Validate IDs, enums, and format patterns
4. **Use type matchers for flexible values**: When exact values don't matter but type does
5. **Test with different data**: Send different values in tests than in the contract
6. **Document binary formats**: Comment on what binary data represents (JPEG magic bytes, etc.)

## Minimal JPEG Bytes

The example uses minimal JPEG bytes for testing:

```typescript
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8,                    // Start of Image (SOI) marker
  0xff, 0xe0,                    // JFIF APP0 Marker
  0x00, 0x10,                    // Length of APP0 segment
  0x4a, 0x46, 0x49, 0x46, 0x00,  // "JFIF\0"
  0x01, 0x02,                    // Major and minor versions
]);
```

This is not a complete JPEG file but contains the essential magic bytes to identify it as JPEG. This is sufficient for testing purposes and keeps the example concise.

## Additional Resources

- [Pact Specification V3](https://github.com/pact-foundation/pact-specification/tree/version-3)
- [Multipart Form Data RFC 7578](https://tools.ietf.org/html/rfc7578)
- [Pact Python Multipart Example](https://github.com/pact-foundation/pact-python/blob/main/examples/catalog/multipart_matching_rules/test_consumer.py)
- [JSON Path Syntax](https://goessner.net/articles/JsonPath/)
- [Pact JS Matching Rules Documentation](../../../docs/matching.md)
