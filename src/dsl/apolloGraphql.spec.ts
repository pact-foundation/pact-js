import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ApolloGraphQLInteraction } from './apolloGraphql';

chai.use(chaiAsPromised);
const { expect } = chai;

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

        const json: any = interaction.json();
        expect(json.request.body.variables).to.deep.eq({ foo: 'bar' });
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

        const json: any = interaction.json();
        expect(json.request.body).to.have.property('variables');
      });
    });
  });

  describe('#withOperation', () => {
    describe('when no operationNaame is presented', () => {
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

        const json: any = interaction.json();
        expect(json.request.body).to.have.property('operationName');
      });
    });
  });
});
