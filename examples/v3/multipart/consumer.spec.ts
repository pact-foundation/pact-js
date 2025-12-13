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

describe('Pact Consumer Test', () => {
  // Initialize a new Pact instance with consumer and provider names
  // Using V3 specification to support multipart form data
  const pact = new PactV3({
    consumer: 'myconsumer',
    provider: 'myprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    logLevel: 'trace',
  });

  it('creates a pact to verify with a text field in form', async () => {
    // Create a multipart form data object with a 'name' field
    const formData = new FormData();
    formData.append('name', 'John Doe');

    // Extract the headers that include the Content-Type with the boundary parameter
    // This boundary is crucial for multipart form data parsing
    const headers = formData.getHeaders();

    // Convert the form data to a string representation for the request body
    const form = formData.getBuffer().toString();

    await pact
      .addInteraction({
        uponReceiving: 'a request for a foo',
        withRequest: {
          method: 'POST',
          path: '/test',
          body: form, // The multipart form data as a string
          headers, // Headers including Content-Type with boundary
        },
        willRespondWith: {
          status: 201,
          body: {
            // Use a matcher to flexibly match any string value for 'foo'
            foo: MatchersV3.like('bar'),
          },
        },
      })
      // Execute the test against the mock server
      .executeTest(async (mockServer) => {
        // Send the actual request to the mock server with the form data
        const response = await axios.post(`${mockServer.url}/test`, formData, {
          headers,
        });

        // Verify the response contains the expected 'foo' field with value 'bar'
        expect(response.data.foo).to.equal('bar');
      });
  });

  it('creates a pact to verify with multipart file upload', async () => {
    // Create a temporary file to upload
    const fs = require('fs');
    const path = require('path');
    const tmpFile = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(tmpFile, 'This is test file content');

    // Create form data with a file upload
    // Read the file content synchronously and append to FormData
    const formData = new FormData();
    const fileContent = fs.readFileSync(tmpFile);
    formData.append('document', fileContent, 'test-file.txt');

    // Extract the headers that include the Content-Type with the boundary parameter
    const headers = formData.getHeaders();

    // Convert the form data to a string representation for the request body
    const form = formData.getBuffer().toString();

    await pact
      .addInteraction({
        states: [{ description: 'a file upload is requested' }],
        uponReceiving: 'a multipart file upload request',
        withRequest: {
          method: 'POST',
          path: '/upload',
          body: form, // The multipart form data as a string (including file content)
          headers, // Headers including Content-Type with boundary
        },
        willRespondWith: {
          status: 200,
          body: {
            // Use matchers to flexibly match any values in the response
            success: MatchersV3.boolean(true),
            message: MatchersV3.like('File uploaded successfully'),
          },
        },
      })
      // Execute the test against the mock server
      .executeTest(async (mockServer) => {
        // Send the actual multipart file upload request
        const response = await axios.post(`${mockServer.url}/upload`, form, {
          headers,
        });

        // Verify the response indicates success
        expect(response.data.success).to.equal(true);
        expect(response.data.message).to.equal('File uploaded successfully');

        // Clean up the temporary file
        fs.unlinkSync(tmpFile);
      });
  });

  it('creates a pact using withRequestMultipartFileUpload helper method', async () => {
    // Use the pre-existing test file in the multipart directory
    const path = require('path');
    const testFile = path.join(__dirname, 'test-upload-file.txt');

    await pact
      .given('a file upload is expected')
      .uponReceiving(
        'a multipart file upload using withRequestMultipartFileUpload'
      )
      .withRequestMultipartFileUpload(
        {
          method: 'POST',
          path: '/upload-file',
        },
        'text/plain', // The content type of the file being uploaded
        testFile,
        'document' // The name of the form field for the file
      )
      .willRespondWith({
        status: 200,
        body: {
          success: MatchersV3.boolean(true),
          filename: MatchersV3.like('test-upload-file.txt'),
          message: MatchersV3.like('File received successfully'),
        },
      })
      .executeTest(async (mockServer) => {
        // Create form data with the file
        const fs = require('fs');
        const formData = new FormData();
        const fileContent = fs.readFileSync(testFile);
        formData.append('document', fileContent, 'test-upload-file.txt');

        // Send the request
        const response = await axios.post(
          `${mockServer.url}/upload-file`,
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        // Verify the response
        expect(response.data.success).to.equal(true);
        expect(response.data.filename).to.equal('test-upload-file.txt');
        expect(response.data.message).to.equal('File received successfully');
      });
  });

  it('creates a pact using withRequestMultipartFileUpload with custom boundary', async () => {
    // Use the pre-existing test file in the multipart directory
    const path = require('path');
    const testFile = path.join(__dirname, 'test-upload-file.txt');
    const customBoundary = 'MyCustomBoundary123456789';

    await pact
      .given('a file upload with custom boundary is expected')
      .uponReceiving('a multipart file upload with custom boundary')
      .withRequestMultipartFileUpload(
        {
          method: 'POST',
          path: '/upload-custom',
        },
        'text/plain', // The content type of the file being uploaded
        testFile,
        'file', // The name of the form field for the file
        customBoundary // Custom boundary string
      )
      .willRespondWith({
        status: 201,
        body: {
          uploaded: MatchersV3.boolean(true),
          boundary: MatchersV3.like(customBoundary),
        },
      })
      .executeTest(async (mockServer) => {
        // Create form data with the file using the same custom boundary
        const fs = require('fs');
        const FormData = require('form-data');
        const formData = new FormData();
        const fileContent = fs.readFileSync(testFile);
        formData.append('file', fileContent, 'test-upload-file.txt');

        // Override the boundary to match our custom one
        const headers = formData.getHeaders();
        headers['content-type'] =
          `multipart/form-data; boundary=${customBoundary}`;

        // Get the form buffer and replace the boundary
        let formBuffer = formData.getBuffer().toString();
        const originalBoundary = formData.getBoundary();
        formBuffer = formBuffer.replace(
          new RegExp(originalBoundary, 'g'),
          customBoundary
        );

        // Send the request
        const response = await axios.post(
          `${mockServer.url}/upload-custom`,
          formBuffer,
          {
            headers,
          }
        );

        // Verify the response
        expect(response.data.uploaded).to.equal(true);
        expect(response.data.boundary).to.equal(customBoundary);
      });
  });
});
