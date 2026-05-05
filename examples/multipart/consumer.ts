import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';

/**
 * Upload a file to the Upload Service.
 *
 * Sends a multipart/form-data POST request with the file as a stream.
 * This is the standard browser/Node.js pattern for file uploads.
 *
 * @param baseUrl - Base URL of the upload service.
 * @param filePath - Absolute path to the file to upload.
 * @param fieldName - The multipart field name the server expects.
 */
export async function uploadFile(
  baseUrl: string,
  filePath: string,
  fieldName: string,
): Promise<{ success: boolean }> {
  const form = new FormData();
  form.append(fieldName, fs.createReadStream(filePath));

  const { data } = await axios.post(`${baseUrl}/upload`, form, {
    headers: form.getHeaders(),
  });
  return data as { success: boolean };
}
