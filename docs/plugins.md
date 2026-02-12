# Plugins

Plugins are the fundamental extension mechanism in Pact. Using the Plugin Framework, you can combine different plugins with the various in-built interaction types to model most interactions in your architecture.

See https://docs.pact.io/plugins for more on this topic.

## Supported Plugins

Publicly available plugins are listed here: https://docs.pact.io/plugins/directory.

Alternatively, you can get an up-to-date list of available plugins via the [CLI](https://docs.pact.io/implementation_guides/pact_plugins/cli).

Plugins may be created for internal use cases and not published to the internet, and may also be used in your tests.

## Matching / Expressions

Like regular Pact tests, plugins can support [expressions](https://github.com/pact-foundation/pact-plugins/blob/main/docs/matching-rule-definition-expressions.md) (not all plugins do, so please be sure to check the docs for the plugin) enabling flexible matching. 

## HTTP Interactions

### Consumer

When using a plugin, each plugin is responsible for defining its inputs/outputs. It is usually a JSON structure that represents the interaction. You will need to consult each plugin to understand what data structure should be supplied to your plugins and on which part of the interaction to supply them (for example, the request or the response).

For example, this uses the [Matt Plugin](https://github.com/mefellows/pact-matt-plugin), a fictional protocol.
```javascript
const mattRequest = `{"request": {"body": "hello"}}`;
const mattResponse = `{"response":{"body":"world"}}`;

await pact
  .addInteraction()
  .given('the Matt protocol exists')
  .uponReceiving('an HTTP request to /matt')
  .usingPlugin({
    plugin: 'matt',
    version: '0.1.1',
  })
  .withRequest('POST', '/matt', (builder) => {
    builder.pluginContents('application/matt', mattRequest);
  })
  .willRespondWith(200, (builder) => {
    builder.pluginContents('application/matt', mattResponse);
  })
  .executeTest((mockserver) => {
    return axios
      .request({
        baseURL: mockserver.url,
        headers: {
          'content-type': 'application/matt',
          Accept: 'application/matt',
        },
        data: generateMattMessage('hello'),
        method: 'POST',
        url: '/matt',
      })
      .then((res) => {
        expect(parseMattMessage(res.data)).to.eq('world');
      });
  });
```

This looks just like other tests, however note the early inclusion of `usingPlugin`. This changes the functions available to the HTTP test, allowing plugins to be used on the request or response portion of the request.

In this case, we want to use a new content type: `application/matt`.

### Provider

The verification side of this test is no different to a usual verification, as it is just an HTTP test. Any required plugins will automatically be loaded by the framework if not present, or an error will be shown should the plugin installation fail.

```js
const { Verifier } = require('@pact-foundation/pact');

const v = new Verifier({
  providerBaseUrl: `http://localhost:${httpPort}`,
  pactUrls: ['./pacts/myconsumer-myprovider.json'],
});

return v.verifyProvider();
```

## Asynchronous Messages

As per the HTTP interaction, calling `usingPlugin` early in the builder allows two additional methods: `withPluginContents` to specify the plugin contents, and `startTransport` to optionally start a transport for this test, if the plugin has one (for example, a gRPC service or in this case, a TCP server).


```js
  describe('Async Message', () => {
    const pact = new Pact({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });

    describe('with plugin contents (application/matt)', async () => {
      it('receives a valid asynchronous MATT message', () => {
        const mattMessage = `{"response":{"body":"tcpworld"}}`;

        return pact
          .addAsynchronousInteraction()
          .given('the Matt protocol is up')
          .usingPlugin({
            plugin: 'matt',
            version: '0.1.1',
          })
          .expectsToReceive('an asynchronous MATT message')
          .withPluginContents(mattMessage, 'application/matt')
          .executeTest(async (message) => {
            // simulate receiving a MATT message

            const response = parseMattMessage(
              Buffer.from(
                String(message?.contents?.content || ''),
                'base64'
              ).toString()
            );
            expect(response).to.deep.eq('tcpworld');
          });
      });
    });
  });
```

## Synchronous Messages

### Consumer

As per the HTTP interaction, calling `usingPlugin` early in the builder allows two additional methods: `withPluginContents` to specify the plugin contents, and `startTransport` to optionally start a transport for this test, if the plugin has one (for example, a gRPC service or in this case, a TCP server).

```js
  describe('TCP (plugin) transport', () => {
    const pact = new Pact({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });

    it('returns a valid MATT message', () => {
      const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

      return pact
        .addSynchronousInteraction('a MATT message')
        .usingPlugin({
          plugin: 'matt',
          version: '0.1.1',
        })
        .withPluginContents(mattMessage, 'application/matt')
        .startTransport('matt', HOST)
        .executeTest(async (tc) => {
          // simulate sending and received a MATT message
          const message = await sendMattMessageTCP('hellotcp', HOST, tc.port);
          expect(message).to.eq('tcpworld');
        });
    });
  });
```  

### Provider

The verification side of this interaction requires you to specify additional transports on the verifier. In this case, where to send the TCP traffic in addition to the HTTP traffic. You also need to map each message interaction to a handler function using `messageProviders`, just as you would for standard message verification.

The rest of the verifier is the same as a normal verification:

```js
const { Verifier, providerWithMetadata } = require('@pact-foundation/pact');

const v = new Verifier({
  providerBaseUrl: `http://${HOST}:${httpPort}`,
  transports: [
    {
      port: tcpPort,
      protocol: 'matt',
      scheme: 'tcp',
    },
  ],
  pactUrls: ['./pacts/myconsumer-myprovider.json'],
  messageProviders: {
    'an asynchronous MATT message': providerWithMetadata(
      () => {
        return Buffer.from('tcpworld');
      },
      { contentType: 'application/matt' }
    ),
  },
});

return v.verifyProvider();
```

For a full working example with HTTP, TCP, and message verification combined, see the [v4 plugins example](https://github.com/pact-foundation/pact-js/tree/master/examples/v4/plugins/).
