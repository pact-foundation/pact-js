import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { GraphQLInteraction } from './graphql';
import { isMatcher } from './matchers';

chai.use(chaiAsPromised);
const { expect } = chai;

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

        const json: any = interaction.json();
        expect(json.request.body.operationName).to.eq('query');
      });
    });
    describe('when given an invalid operation', () => {
      it('fails with an error', () => {
        expect(interaction.withOperation.bind('aoeu')).to.throw(Error);
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

        const json: any = interaction.json();
        expect(json.request.body.operationName).to.eq(null);
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

        const json: any = interaction.json();
        expect(json.request.body.variables).to.deep.eq({ foo: 'bar' });
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

        const json: any = interaction.json();
        expect(json.request.body).to.not.have.property('variables');
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

        const json: any = interaction.json();
        expect(json.request.body).to.have.property('variables');
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
        expect(() => interaction.withQuery(null as any)).to.throw();
      });
    });

    describe('when given an invalid query', () => {
      it('fails with an error', () => {
        expect(() =>
          interaction.withQuery('{ not properly terminated')
        ).to.throw(Error);
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

          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).to.eq(true);
          const r = new RegExp(json.request.body.query.regex, 'g');
          const lotsOfWhitespace = `{             hello

        }`;
          expect(r.test(lotsOfWhitespace)).to.eq(true);
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
          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).to.eq(true);
          const r = new RegExp(json.request.body.query.regex, 'g');
          // eslint-disable-next-line no-useless-escape
          const lotsOfWhitespace = `{             Hello(id: \$id) { name    } }`;
          expect(r.test(lotsOfWhitespace)).to.eq(true);
        });
      });
    });
  });

  describe('#json', () => {
    context('when query is empty', () => {
      it('fails with an error', () => {
        expect(() => interaction.json()).to.throw();
      });
    });

    context('when description is empty', () => {
      it('fails with an error', () => {
        interaction.withQuery('{ hello }');

        return expect(() => interaction.json()).to.throw();
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

        const json: any = interaction.json();
        expect(json.request.body).to.not.have.property('operationName');
      });
    });
  });

  context('when given a valid query', () => {
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

      const json: any = interaction.json();
      expect(isMatcher(json.request.body.query)).to.eq(true);
      expect(json.request.body.query.getValue()).to.eq('{ hello }');
    });
  });

  context('headers are not duplicated', () => {
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

        const json: any = interaction.json();
        expect(json.request.headers).to.deep.eq({
          'Content-Type': 'application/json',
        });
      });
    });
  });
});
