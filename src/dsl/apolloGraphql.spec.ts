import { ApolloGraphQLInteraction } from './apolloGraphql';

describe('ApolloGraphQLInteraction', () => {
  let interaction: ApolloGraphQLInteraction;

  beforeEach(() => {
    interaction = new ApolloGraphQLInteraction();
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

    describe('when no variables are presented', () => {
      it('adds an empty variables property to the payload', () => {
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
        expect(json.request.body).toHaveProperty('variables');
      });
    });
  });

  describe('#withOperation', () => {
    describe('when no operationName is presented', () => {
      it('adds a null operationName property to the payload', () => {
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
        expect(json.request.body).toHaveProperty('operationName');
      });
    });
  });
});
