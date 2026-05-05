import {
  type LogLevel,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { sendMattRequest } from './consumer';

/**
 * Consumer Pact tests for the MATT protocol plugin.
 *
 * MATT is a fictional wire format used here purely for demonstration — it
 * wraps a string payload with the literal "MATT" on each side (so "hello"
 * becomes "MATThelloMATT"). It is not a real protocol.
 *
 * Pact plugins extend the core framework to support custom content types and
 * protocols. This example uses the 'matt' plugin, which handles the MATT wire
 * format. The same Pact API (`usingPlugin`, `pluginContents`) applies to real
 * plugins such as `pact-protobuf-plugin` for gRPC, Avro, Thrift, or any
 * other protocol you can encode as a plugin.
 *
 * `usingPlugin()` tells Pact to load the named plugin for this interaction.
 * `builder.pluginContents()` defines the expected request and response bodies
 * in the plugin's native format (here: raw MATT-encoded JSON strings).
 */
describe('sendMattRequest', () => {
  const pact = new Pact({
    consumer: 'MattConsumer',
    provider: 'MattProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('sends a MATT request and receives a MATT response', async () => {
    const mattRequest = `{"request": {"body": "hello"}}`;
    const mattResponse = `{"response":{"body":"world"}}`;

    await pact
      .addInteraction()
      .given('the MATT service is running')
      .uponReceiving('a MATT request with payload hello')
      // Declare which plugin handles this interaction. The plugin name and
      // version must match an installed plugin (~/.pact/plugins/).
      .usingPlugin({ plugin: 'matt', version: '0.1.1' })
      .withRequest('POST', '/matt', (builder) => {
        // pluginContents() passes the body to the plugin for encoding and matching.
        // The first argument is the content type; the second is a plugin-specific
        // specification string (see the plugin's documentation).
        builder.pluginContents('application/matt', mattRequest);
      })
      .willRespondWith(200, (builder) => {
        builder.pluginContents('application/matt', mattResponse);
      })
      .executeTest(async (mockserver) => {
        const response = await sendMattRequest(mockserver.url, 'hello');
        expect(response).toBe('world');
      });
  });
});
