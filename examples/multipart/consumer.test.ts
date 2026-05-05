import path from 'node:path';
import {
  type LogLevel,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { uploadFile } from './consumer';

/**
 * Consumer Pact tests for file upload.
 *
 * Pact's `multipartBody()` builder helper creates a multipart/form-data
 * interaction. It reads the file at the given path to generate the boundary
 * and content type headers automatically.
 *
 * The contract captures: which HTTP method and path, the multipart field
 * name, the content type of the file, and the response shape. It does NOT
 * contract the file contents — only that a file of the given type was sent
 * in the expected field.
 */
describe('uploadFile', () => {
  const pact = new Pact({
    consumer: 'UploadConsumer',
    provider: 'UploadProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('uploads a file successfully', async () => {
    // Use the self-contained fixture file for testing — keeps this example independent.
    const testFile = path.resolve(__dirname, 'fixtures/sample.txt');

    await pact
      .addInteraction()
      .given('the upload service is ready')
      .uponReceiving('a multipart file upload')
      .withRequest('POST', '/upload', (builder) => {
        // multipartBody() sets the Content-Type header with the correct
        // boundary and encodes the file field. The field name ('file') must
        // match what the provider's multer configuration expects.
        builder.multipartBody('text/plain', testFile, 'file');
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ success: true });
      })
      .executeTest(async (mockserver) => {
        const result = await uploadFile(mockserver.url, testFile, 'file');
        expect(result.success).toBe(true);
      });
  });
});
