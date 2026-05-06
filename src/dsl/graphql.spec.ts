import { GraphQLInteraction } from './graphql';
import { isMatcher } from './matchers';

describe('GraphQLInteraction', () => {
  let interaction: GraphQLInteraction;

  beforeEach(() => {
    interaction = new GraphQLInteraction();
  });

  describe('#withOperation', () => {
    describe('when given a valid operation', () => {
      it('creates a GraphQL Interaction', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation('query');
        interaction.withQuery('{ hello }');
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body.operationName).toBe('query');
      });
    });

    describe('when given an invalid operation', () => {
      it('fails with an error', () => {
        expect(interaction.withOperation.bind('aoeu')).toThrow(Error);
      });
    });

    describe('when given a null operation', () => {
      it('creates a GrphQL Interaction', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation(null);
        interaction.withQuery('{ hello }');
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body.operationName).toBeNull();
      });
    });
  });

  describe('#withVariables', () => {
    describe('when given a set of variables', () => {
      it('adds the variables to the payload', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation('query');
        interaction.withQuery('{ hello }');
        interaction.withVariables({
          foo: 'bar',
        });
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body.variables).toEqual({ foo: 'bar' });
      });
    });

    describe('when no variables are provided', () => {
      it('does not add the variables property to the payload', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation('query');
        interaction.withQuery('{ hello }');
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body).not.toHaveProperty('variables');
      });
    });

    describe('when an empty variables object is presented', () => {
      it('adds the variables property to the payload', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation('query');
        interaction.withQuery('{ hello }');
        interaction.withVariables({});
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body).toHaveProperty('variables');
      });
    });
  });

  describe('#withQuery', () => {
    beforeEach(() => {
      interaction.uponReceiving('a request');
      interaction.withRequest({
        path: '/graphql',
        method: 'POST',
      });
      interaction.withOperation('query');
      interaction.withQuery('{ hello }');
      interaction.withVariables({
        foo: 'bar',
      });
      interaction.willRespondWith({
        status: 200,
        body: { data: {} },
      });
    });

    describe('when given an empty query', () => {
      it('fails with an error', () => {
        // biome-ignore lint/suspicious/noExplicitAny: deliberately passing null to test error handling on invalid input
        expect(() => interaction.withQuery(null as any)).toThrow();
      });
    });

    describe('when given an invalid query', () => {
      it('fails with an error', () => {
        expect(() =>
          interaction.withQuery('{ not properly terminated'),
        ).toThrow(Error);
      });
    });

    describe('when given a valid query', () => {
      describe('without variables', () => {
        it('adds regular expressions for the whitespace in the query', () => {
          interaction.uponReceiving('a request');
          interaction.withRequest({
            path: '/graphql',
            method: 'POST',
          });
          interaction.withOperation('query');
          interaction.withQuery('{ hello }');
          interaction.willRespondWith({
            status: 200,
            body: { data: {} },
          });

          // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).toBe(true);
          const r = new RegExp(json.request.body.query.regex, 'g');
          const lotsOfWhitespace = `{             hello

        }`;
          expect(r.test(lotsOfWhitespace)).toBe(true);
        });
      });

      describe('and variables', () => {
        it('adds regular expressions for the whitespace in the query', () => {
          interaction.withQuery(`{
            Hello(id: $id) {
              name
            }
          }`);
          interaction.withVariables({
            name: 'bar',
          });
          // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).toBe(true);
          const r = new RegExp(json.request.body.query.regex, 'g');
          const lotsOfWhitespace = `{             Hello(id: $id) { name    } }`;
          expect(r.test(lotsOfWhitespace)).toBe(true);
        });
      });
    });
  });

  describe('#json', () => {
    describe('when query is empty', () => {
      it('fails with an error', () => {
        expect(() => interaction.json()).toThrow();
      });
    });

    describe('when description is empty', () => {
      it('fails with an error', () => {
        interaction.withQuery('{ hello }');

        return expect(() => interaction.json()).toThrow();
      });
    });

    describe('when no operation is provided', () => {
      it('does not be present in unmarshaled body', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withQuery('{ hello }');
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.body).not.toHaveProperty('operationName');
      });
    });
  });

  describe('when given a valid query', () => {
    it('marshals the query to JSON', () => {
      interaction.uponReceiving('a request');
      interaction.withRequest({
        path: '/graphql',
        method: 'POST',
      });
      interaction.withOperation('query');
      interaction.withQuery('{ hello }');
      interaction.willRespondWith({
        status: 200,
        body: { data: {} },
      });

      // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
      const json: any = interaction.json();
      expect(isMatcher(json.request.body.query)).toBe(true);
      expect(json.request.body.query.getValue()).toBe('{ hello }');
    });
  });

  describe('headers are not duplicated', () => {
    describe('headers are properly cased', () => {
      it('content-type header is properly cased', () => {
        interaction.uponReceiving('a request');
        interaction.withRequest({
          path: '/graphql',
          method: 'POST',
        });
        interaction.withOperation('query');
        interaction.withQuery('{ hello }');
        interaction.willRespondWith({
          status: 200,
          body: { data: {} },
        });

        // biome-ignore lint/suspicious/noExplicitAny: body sub-properties (query/variables/operationName) are typed as AnyTemplate and need runtime assertions
        const json: any = interaction.json();
        expect(json.request.headers).toEqual({
          'Content-Type': 'application/json',
        });
      });
    });
  });
});
