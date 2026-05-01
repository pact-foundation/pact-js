import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import axios from 'axios';
import fs = require('node:fs');
import net = require('node:net');
import path = require('node:path');

import { PactV4 } from './v4';
import { MatchersV3 } from './v3';

const { expect } = chai;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('V4 Pact', () => {
  let pact: PactV4;
  const pactFilePath = path.resolve(
    process.cwd(),
    'pacts',
    'v4consumer-v4provider.json',
  );

  const interactionByDescription = (
    description: string,
  ): Record<string, unknown> => {
    const pactJson = JSON.parse(fs.readFileSync(pactFilePath, 'utf8')) as {
      interactions: Array<Record<string, unknown>>;
    };

    const matches = pactJson.interactions.filter(
      (item) => item.description === description,
    );

    expect(
      matches,
      `expected exactly one interaction for "${description}"`,
    ).to.have.lengthOf(1);

    const [interaction] = matches;

    return interaction as Record<string, unknown>;
  };

  const expectCommentsToContain = (
    interaction: Record<string, unknown>,
    reason: string,
    textComment: string,
    testName: string,
  ): void => {
    const comments = interaction.comments as Record<string, unknown>;

    expect(comments.reason).to.equal(reason);
    expect(comments.text).to.include(textComment);
    expect(comments.testname).to.equal(testName);
  };

  const expectReferenceToEqual = (
    interaction: Record<string, unknown>,
    group: string,
    name: string,
    value: string,
  ): void => {
    const comments = interaction.comments as Record<string, unknown>;
    const references = comments.references as Record<
      string,
      Record<string, string>
    >;

    expect(references[group][name]).to.equal(value);
  };

  beforeEach(() => {
    pact = new PactV4({
      consumer: 'v4consumer',
      provider: 'v4provider',
    });
  });

  describe('HTTP req/res contract', () => {
    it('generates a pact', () =>
      pact
        .addInteraction()
        .given('some state')
        .given('a second state')
        .uponReceiving('a standard HTTP req/res')
        .withRequest('POST', '/', (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .willRespondWith(200, (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .executeTest(async (server) =>
          axios.post(
            server.url,
            {
              foo: 'bar',
            },
            {
              headers: {
                'x-foo': 'x-bar',
              },
            },
          ),
        ));

    it('generates a pact with interaction metadata', async () => {
      const description = 'v4 metadata http req/res interaction';

      await pact
        .addInteraction()
        .given('some state')
        .given('a second state')
        .uponReceiving(description)
        .pending()
        .comment({ key: 'reason', value: 'covered by HTTP metadata test' })
        .comment('second note from HTTP metadata test')
        .testName('http metadata test name')
        .withRequest('POST', '/', (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .willRespondWith(200, (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .executeTest(async (server) =>
          axios.post(
            server.url,
            {
              foo: 'bar',
            },
            {
              headers: {
                'x-foo': 'x-bar',
              },
            },
          ),
        );

      const interaction = interactionByDescription(description);

      expect(interaction.pending).to.equal(true);
      expectCommentsToContain(
        interaction,
        'covered by HTTP metadata test',
        'second note from HTTP metadata test',
        'http metadata test name',
      );
    });

    it('records interaction references in the pact file', async () => {
      const description = 'v4 http interaction with references';

      await pact
        .addInteraction()
        .uponReceiving(description)
        .reference(
          'Jira',
          'TICKET-123',
          'https://jira.example.com/TICKET-123',
        )
        .withRequest('GET', '/')
        .willRespondWith(200)
        .executeTest(async (server) => axios.get(server.url));

      const interaction = interactionByDescription(description);

      expectReferenceToEqual(
        interaction,
        'Jira',
        'TICKET-123',
        'https://jira.example.com/TICKET-123',
      );
    });

    it('supports regex matcher for response content-type with optional charset', () =>
      pact
        .addInteraction()
        .uponReceiving('a response with regex content-type header matcher')
        .withRequest('GET', '/')
        .willRespondWith(200, (builder) => {
          builder
            .headers({
              'Content-Type': MatchersV3.regex(
                /^application\/json(;\s?charset=[\w-]+)?$/i,
                'application/json',
              ),
            })
            .jsonBody({
              foo: 'bar',
            });
        })
        .executeTest(async (server) => {
          const response = await axios.get(server.url);
          expect(response.data).to.deep.equal({ foo: 'bar' });
        }));

    it('supports regex matcher for request content-type with optional charset', () =>
      pact
        .addInteraction()
        .uponReceiving('a request with regex content-type header matcher')
        .withRequest('POST', '/', (builder) => {
          builder
            .headers({
              'Content-Type': MatchersV3.regex(
                /^application\/json(;\s?charset=[\w-]+)?$/i,
                'application/json',
              ),
            })
            .jsonBody({
              foo: 'bar',
            });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            ok: true,
          });
        })
        .executeTest((server) =>
          axios.post(server.url, {
            foo: 'bar',
          }),
        ));
  });

  describe('Asynchronous message contract', () => {
    it('generates a pact with interaction metadata', async () => {
      const description = 'v4 metadata async interaction message';

      await pact
        .addAsynchronousInteraction()
        .given('an async message state')
        .pending()
        .comment({ key: 'reason', value: 'covered by async metadata test' })
        .comment('second note from async metadata test')
        .testName('async metadata test name')
        .expectsToReceive(description, (builder) => {
          builder.withJSONContent({
            event: 'user.created',
          });
        })
        .executeTest(async () => Promise.resolve());

      const interaction = interactionByDescription(description);

      expect(interaction.pending).to.equal(true);
      expectCommentsToContain(
        interaction,
        'covered by async metadata test',
        'second note from async metadata test',
        'async metadata test name',
      );
    });

    it('records interaction references in the pact file', async () => {
      const description = 'v4 async interaction with references';

      await pact
        .addAsynchronousInteraction()
        .reference(
          'GitHub',
          'PR-456',
          'https://github.com/example/repo/pull/456',
        )
        .expectsToReceive(description, (builder) => {
          builder.withJSONContent({ event: 'user.created' });
        })
        .executeTest(async () => Promise.resolve());

      const interaction = interactionByDescription(description);

      expectReferenceToEqual(
        interaction,
        'GitHub',
        'PR-456',
        'https://github.com/example/repo/pull/456',
      );
    });
  });

  describe('Synchronous message contract', () => {
    it('generates a pact with interaction metadata', async () => {
      const description = 'v4 metadata sync interaction message';

      await pact
        .addSynchronousInteraction(description)
        .given('a synchronous message state')
        .pending()
        .comment({ key: 'reason', value: 'covered by sync metadata test' })
        .comment('second note from sync metadata test')
        .testName('sync metadata test name')
        .withRequest((builder) => {
          builder.withJSONContent({
            request: 'ping',
          });
        })
        .withResponse((builder) => {
          builder.withJSONContent({
            response: 'pong',
          });
        })
        .executeTest(async () => Promise.resolve());

      const interaction = interactionByDescription(description);

      expect(interaction.pending).to.equal(true);
      expectCommentsToContain(
        interaction,
        'covered by sync metadata test',
        'second note from sync metadata test',
        'sync metadata test name',
      );
    });

    it('records interaction references in the pact file', async () => {
      const description = 'v4 sync interaction with references';

      await pact
        .addSynchronousInteraction(description)
        .reference(
          'Jira',
          'TICKET-789',
          'https://jira.example.com/TICKET-789',
        )
        .withRequest((builder) => {
          builder.withJSONContent({ request: 'ping' });
        })
        .withResponse((builder) => {
          builder.withJSONContent({ response: 'pong' });
        })
        .executeTest(async () => Promise.resolve());

      const interaction = interactionByDescription(description);

      expectReferenceToEqual(
        interaction,
        'Jira',
        'TICKET-789',
        'https://jira.example.com/TICKET-789',
      );
    });
  });

  describe('Plugin test', () => {
    describe('Using the MATT plugin', () => {
      const parseMattMessage = (raw: string): string =>
        raw.replace(/(MATT)+/g, '').trim();

      const generateMattMessage = (raw: string): string => `MATT${raw}MATT`;

      describe('HTTP interface', () => {
        it('generates a pact', async () => {
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
            .executeTest((mockserver) =>
              axios
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
                }),
            );
        });
      });

      describe('Synchronous Message (TCP) ', () => {
        describe('with MATT protocol', () => {
          const HOST = '127.0.0.1';

          const sendMattMessageTCP = (
            message: string,
            host: string,
            port: number,
          ): Promise<string> => {
            const socket = net.connect({
              port,
              host,
            });

            const res = socket.write(`${generateMattMessage(message)}\n`);

            if (!res) {
              throw Error('unable to connect to host');
            }

            return new Promise((resolve) => {
              socket.on('data', (data) => {
                resolve(parseMattMessage(data.toString()));
                socket.destroy();
              });
            });
          };

          it('generates a pact', () => {
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
                const message = await sendMattMessageTCP(
                  'hellotcp',
                  HOST,
                  tc.port,
                );
                expect(message).to.eq('tcpworld');
              });
          });
        });
      });
    });
  });
});
