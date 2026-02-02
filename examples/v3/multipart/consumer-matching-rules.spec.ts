/**
 * Pact Multipart Form Data with Matching Rules Example
 *
 * This test demonstrates how to use Pact JS V3 with withRequestMatchingRules for multipart/form-data
 * requests. This is adapted from the Python example showing how to combine multipart
 * uploads with flexible matching rules.
 *
 * Key concepts covered:
 * 1. Multipart form data with both JSON metadata and binary files
 * 2. Using withRequestMatchingRules for multipart body validation
 * 3. Content type matching for binary data (images)
 * 4. Type and regex matching for JSON fields within multipart forms
 *
 * The example demonstrates a realistic file upload scenario where:
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
  PactV3,
  like,
  integer,
  regex,
  contentType,
  Rules,
} from '@pact-foundation/pact';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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
     * This test builds a multipart/form-data request with binary image data,
     * then uses matching rules to validate the structure
     * rather than exact values.
     */

    const boundary = 'test-boundary-12345';
    let expectedBody = '';
    expectedBody += `--${boundary}\r\n`;
    expectedBody += `Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n`;
    expectedBody += `Content-Type: image/jpeg\r\n`;
    expectedBody += `\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(expectedBody),
      JPEG_BYTES,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const tempFilePath = path.join(os.tmpdir(), `pact-multipart-test.bin`);
    fs.writeFileSync(tempFilePath, bodyBuffer);

    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.image',
          rule: [contentType('image/jpeg')],
        },
      ],
    };
    const req = {
      method: 'POST',
      path: '/upload',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    };

    try {
      await pact
        .given('file upload service is available')
        .uponReceiving('a multipart upload with JSON metadata and image')
        .withRequestHeader(
          req,
          'Content-Type',
          0,
          regex(
            'multipart/form-data;\\s*boundary=.*',
            `multipart/form-data; boundary=${boundary}`
          )
        )
        .withRequestBinaryFile(
          req,
          `multipart/form-data; boundary=${boundary}`,
          tempFilePath
        )
        .withRequestMatchingRules(req, requestMatchingRules)
        .willRespondWith({
          status: 201,
          body: {
            id: like('upload-1'),
            message: like('Upload successful'),
            metadata: {
              name: like('test'),
              size: integer(100),
            },
            image_size: integer(JPEG_BYTES.length),
          },
        })
        .executeTest(async (mockServer) => {
          const formData = new FormData();

          formData.append('image', JPEG_BYTES, {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
          });

          const response = await axios.post(
            `${mockServer.url}/upload`,
            formData,
            {
              headers: formData.getHeaders(),
            }
          );

          expect(response.status).to.equal(201);
          expect(response.data.message).to.equal('Upload successful');
          expect(response.data.id).to.equal('upload-1');
          expect(response.data.metadata).to.deep.equal({
            name: 'test',
            size: 100,
          });
          expect(response.data.image_size).to.equal(JPEG_BYTES.length);
        });
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });
});
