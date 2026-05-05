import axios from 'axios';
import { generateMattMessage, parseMattMessage } from './protocol';

/**
 * Sends a MATT-encoded message to the MATT service over HTTP.
 *
 * The consumer serialises the payload using the MATT protocol, sends it as
 * the request body with `Content-Type: application/matt`, and deserialises
 * the response. The Pact plugin handles matching MATT-encoded bodies in the
 * contract test — the consumer code itself doesn't need to change.
 *
 * @param baseUrl - Base URL of the MATT service.
 * @param payload - Unencoded string payload to send.
 * @returns The decoded response payload.
 */
export async function sendMattRequest(
  baseUrl: string,
  payload: string,
): Promise<string> {
  const { data } = await axios.post(
    `${baseUrl}/matt`,
    generateMattMessage(payload),
    {
      headers: {
        'Content-Type': 'application/matt',
        Accept: 'application/matt',
      },
      responseType: 'text',
    },
  );
  return parseMattMessage(data as string);
}
