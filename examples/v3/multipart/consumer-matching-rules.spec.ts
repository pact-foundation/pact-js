/**
 * Pact Multipart Form Data with Matching Rules Example
 *
 * This test demonstrates how to use Pact JS V3 with matching rules for multipart/form-data
 * requests. This is adapted from the Python example showing how to combine multipart
 * uploads with flexible matching rules.
 *
 * Key concepts covered:
 * 1. Multipart form data with both JSON metadata and binary files
 * 2. Using withRequestMatchingRules for multipart body validation
 * 3. Content type matching for binary data (images)
 * 4. Type and regex matching for JSON fields within multipart forms
 * 5. Fixed boundaries for consistent testing
 *
 * The example demonstrates a realistic file upload scenario where:
 * - A JSON metadata part contains file information (name, size)
 * - A binary image part contains JPEG data
 * - Matching rules validate structure and types rather than exact values
 *
 * This approach allows flexibility in test data while maintaining contract validation.
 *
 * see https://docs.pact.io for more information on Pact
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  SpecificationVersion,
  PactV3,
  MatchersV3,
} from '@pact-foundation/pact';
import FormData from 'form-data';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact Multipart with Matching Rules', () => {
  /**
   * Initialize a new Pact instance with consumer and provider names.
   */
  const pact = new PactV3({
    consumer: 'multipart-consumer',
    provider: 'multipart-provider',
    logLevel: 'trace',
  });

  // Minimal JPEG for testing. The important part is the magic bytes.
  // This is not a complete JPEG file, but is sufficient for testing purposes.
  const JPEG_BYTES = Buffer.from([
    0xff,
    0xd8, // Start of Image (SOI) marker
    0xff,
    0xe0, // JFIF APP0 Marker
    0x00,
    0x10, // Length of APP0 segment
    0x4a,
    0x46,
    0x49,
    0x46,
    0x00, // "JFIF\0"
    0x01,
    0x02, // Major and minor versions
  ]);

  it('uploads multipart form with JSON metadata and image using matching rules', async () => {
    /**
     * This test builds a multipart/form-data request with both JSON metadata
     * and binary image data, then uses matching rules to validate the structure
     * rather than exact values.
     *
     * Key points:
     * - Uses a fixed boundary for consistent testing
     * - Defines matching rules for the multipart body parts
     * - Uses $.metadata to match the JSON part
     * - Uses $.image to match the binary part
     * - Allows different values in actual requests as long as they match the rules
     * - Form-data library can be configured to use a fixed boundary
     */

    // Use a fixed boundary for testing to ensure consistent Pact files
    const boundary = 'test-boundary-12345';

    // Sample metadata for the example in the contract
    const metadata = {
      name: 'test',
      size: 100,
    };

    // Build the multipart body manually with both JSON and binary parts
    let expectedBody = '';
    expectedBody += `--${boundary}\r\n`;
    expectedBody += `Content-Disposition: form-data; name="metadata"\r\n`;
    expectedBody += `Content-Type: application/json\r\n`;
    expectedBody += `\r\n`;
    expectedBody += `${JSON.stringify(metadata)}\r\n`;
    expectedBody += `--${boundary}\r\n`;
    expectedBody += `Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n`;
    expectedBody += `Content-Type: image/jpeg\r\n`;
    expectedBody += `\r\n`;

    // Convert string to buffer and append binary JPEG data
    let bodyBuffer = Buffer.concat([
      Buffer.from(expectedBody),
      JPEG_BYTES,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    /**
     * Define matching rules for the multipart body.
     *
     * Matching rules for multipart bodies use the format:
     * - $.image - matches the entire image part (for content type)
     * - $.metadata - matches the entire metadata part (for type)
     * - $.metadata.name - matches a field within the metadata JSON
     * - $.metadata.size - matches another field within the metadata JSON
     *
     * These rules allow flexibility in the actual data sent while
     * ensuring the contract structure is maintained.
     */
    const requestMatchingRules = {
      body: {
        // Match content type of the image part to allow any valid JPEG
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
        /**
         * Execute the test with different data that still matches the rules.
         *
         * Note that we're sending:
         * - Different name: "different" instead of "test" (but still matches [a-zA-Z]+)
         * - Different size: 200 instead of 100 (but still an integer)
         * - Same JPEG data (matches image/jpeg content type)
         *
         * The matching rules ensure this different data is still valid.
         * We use the same fixed boundary to ensure the request matches.
         */

        // Create FormData with a fixed boundary to match the contract
        const formData = new FormData();

        // Override the default boundary with our fixed one
        formData.getBoundary = () => boundary;

        // Add JSON metadata with different values
        formData.append(
          'metadata',
          JSON.stringify({ name: 'different', size: 200 }),
          {
            contentType: 'application/json',
          }
        );

        // Add the same JPEG image
        formData.append('image', JPEG_BYTES, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

        // Send the request to the mock server
        const response = await axios.post(
          `${mockServer.url}/upload`,
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        // Verify the response
        expect(response.status).to.equal(201);
        expect(response.data.message).to.equal('Upload successful');
        expect(response.data.id).to.equal('upload-1');
        expect(response.data.metadata).to.deep.equal({
          name: 'test',
          size: 100,
        });
        expect(response.data.image_size).to.equal(JPEG_BYTES.length);
      });
  });

  it('validates multipart upload with multiple files and matching rules', async () => {
    /**
     * This test demonstrates a more complex multipart scenario with:
     * - Multiple file uploads (profile picture and document)
     * - JSON metadata for user information
     * - Different content types for different parts
     * - Matching rules for flexibility
     */

    const boundary = 'test-boundary-67890';

    // Sample metadata for user profile
    const userMetadata = {
      userId: 'user-12345',
      uploadType: 'profile-update',
      timestamp: 1736250000000,
    };

    // Build multipart body with metadata and two files
    let expectedBody = '';

    // Part 1: JSON metadata
    expectedBody += `--${boundary}\r\n`;
    expectedBody += `Content-Disposition: form-data; name="metadata"\r\n`;
    expectedBody += `Content-Type: application/json\r\n`;
    expectedBody += `\r\n`;
    expectedBody += `${JSON.stringify(userMetadata)}\r\n`;

    // Part 2: Profile picture (JPEG)
    expectedBody += `--${boundary}\r\n`;
    expectedBody += `Content-Disposition: form-data; name="profilePicture"; filename="profile.jpg"\r\n`;
    expectedBody += `Content-Type: image/jpeg\r\n`;
    expectedBody += `\r\n`;

    let bodyBuffer = Buffer.from(expectedBody);
    bodyBuffer = Buffer.concat([bodyBuffer, JPEG_BYTES]);

    // Part 3: Document (text file)
    const documentText = Buffer.from('Sample document content');
    bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(`\r\n`)]);
    bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(`--${boundary}\r\n`)]);
    bodyBuffer = Buffer.concat([
      bodyBuffer,
      Buffer.from(
        `Content-Disposition: form-data; name="document"; filename="doc.txt"\r\n`
      ),
    ]);
    bodyBuffer = Buffer.concat([
      bodyBuffer,
      Buffer.from(`Content-Type: text/plain\r\n\r\n`),
    ]);
    bodyBuffer = Buffer.concat([bodyBuffer, documentText]);
    bodyBuffer = Buffer.concat([
      bodyBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    /**
     * Define comprehensive matching rules for all parts
     */
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

    await pact
      .given('user profile upload service is available')
      .uponReceiving('a multipart upload with metadata and multiple files')
      .withRequestMatchingRules(
        {
          method: 'POST',
          path: '/profile/upload',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            Authorization: 'Bearer token-abc-123',
          },
          body: bodyBuffer.toString('binary'),
        },
        JSON.stringify(requestMatchingRules)
      )
      .willRespondWith({
        status: 201,
        body: {
          success: MatchersV3.boolean(true),
          uploadId: MatchersV3.uuid('a3f2c8b1-9d4e-4c7a-b2e5-f8a9c1d3e5f7'),
          filesProcessed: MatchersV3.integer(2),
          metadata: {
            userId: MatchersV3.like('user-12345'),
            uploadType: MatchersV3.like('profile-update'),
            timestamp: MatchersV3.integer(1736250000000),
          },
        },
      })
      .executeTest(async (mockServer) => {
        /**
         * Send actual request with different but valid data
         */

        // Create FormData with a fixed boundary
        const formData = new FormData();

        // Override the default boundary with our fixed one
        formData.getBoundary = () => boundary;

        // Different metadata values that still match the rules
        formData.append(
          'metadata',
          JSON.stringify({
            userId: 'user-98765', // Different user ID
            uploadType: 'document-upload', // Different upload type
            timestamp: 1736260000000, // Different timestamp
          }),
          {
            contentType: 'application/json',
          }
        );

        // Profile picture
        formData.append('profilePicture', JPEG_BYTES, {
          filename: 'my-photo.jpg',
          contentType: 'image/jpeg',
        });

        // Document
        formData.append('document', Buffer.from('Different document text'), {
          filename: 'mydoc.txt',
          contentType: 'text/plain',
        });

        const response = await axios.post(
          `${mockServer.url}/profile/upload`,
          formData,
          {
            headers: {
              Authorization: 'Bearer token-abc-123',
              ...formData.getHeaders(),
            },
          }
        );

        // Verify response
        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.uploadId).to.be.a('string');
        expect(response.data.filesProcessed).to.equal(2);
        expect(response.data.metadata.userId).to.equal('user-12345');
      });
  });
});
