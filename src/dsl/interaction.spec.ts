import { HTTPMethods } from '../common/request';
import {
  Interaction,
  type InteractionState,
  type RequestOptions,
  type ResponseOptions,
} from './interaction';
import { eachLike, term } from './matchers';

describe('Interaction', () => {
  describe('#given', () => {
    it('creates Interaction with provider state', () => {
      const actual = new Interaction()
        .uponReceiving('r')
        .given('provider state');

      expect(actual.state).toEqual({
        description: 'r',
        providerState: 'provider state',
      });
    });

    describe('without provider state', () => {
      it('creates Interaction when blank', () => {
        const actual = new Interaction().uponReceiving('r').given('').state;
        expect(actual).toEqual({ description: 'r' });
      });

      it('creates Interaction when nothing is passed', () => {
        const actual = new Interaction().uponReceiving('r').state;
        expect(actual).toEqual({ description: 'r' });
      });
    });
  });

  describe('#uponReceiving', () => {
    const interaction = new Interaction();

    it('throws error when no description provided', () => {
      expect(interaction.uponReceiving).toThrow(
        'You must provide a description for the interaction.',
      );
    });

    it('has a state with description', () => {
      interaction.uponReceiving('an interaction description');
      expect(interaction.state).toEqual({
        description: 'an interaction description',
      });
    });
  });

  describe('#withRequest', () => {
    const interaction = new Interaction();

    it('throws error when method is not provided', () => {
      expect(
        interaction.withRequest.bind(
          interaction,
          {} as unknown as RequestOptions,
        ),
      ).toThrow('You must provide an HTTP method.');
    });

    it('throws error when an invalid method is provided', () => {
      expect(
        interaction.withRequest.bind(interaction, {
          method: 'FOO',
        } as unknown as RequestOptions),
      ).toThrow(
        'You must provide a valid HTTP method: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, COPY, LOCK, MKCOL, MOVE, PROPFIND, PROPPATCH, UNLOCK, REPORT.',
      );
    });

    it('throws error when method is not provided but path is provided', () => {
      expect(
        interaction.withRequest.bind(interaction, {
          path: '/',
        } as unknown as RequestOptions),
      ).toThrow('You must provide an HTTP method.');
    });

    it('throws error when path is not provided', () => {
      expect(
        interaction.withRequest.bind(interaction, {
          method: HTTPMethods.GET,
        } as unknown as RequestOptions),
      ).toThrow('You must provide a path.');
    });

    it('throws error when query object is not a string', () => {
      expect(
        interaction.withRequest.bind(interaction, {
          method: HTTPMethods.GET,
          path: '/',
          query: { string: false, query: 'false' },
        } as unknown as RequestOptions),
      ).toThrow('Query must only contain strings.');
    });

    describe('with only mandatory params', () => {
      const actual = new Interaction()
        .uponReceiving('a request')
        .withRequest({ method: HTTPMethods.GET, path: '/search' }).state;

      it('has a state containing only the given keys', () => {
        expect(actual).toHaveProperty('request');
        expect(actual.request).toHaveProperty('method');
        expect(actual.request).toHaveProperty('path');
      });

      it('request has no other keys', () => {
        expect(actual.request).not.toHaveProperty('query');
        expect(actual.request).not.toHaveProperty('headers');
        expect(actual.request).not.toHaveProperty('body');
      });
    });

    describe('with all other parameters', () => {
      const actual = new Interaction().uponReceiving('request').withRequest({
        body: { id: 1, name: 'Test', due: 'tomorrow' },
        headers: { 'Content-Type': 'application/json' },
        method: HTTPMethods.GET,
        path: '/search',
        query: 'q=test',
      }).state;

      it('has a full state all available keys', () => {
        expect(actual).toHaveProperty('request');
        expect(actual.request).toHaveProperty('method');
        expect(actual.request).toHaveProperty('path');
        expect(actual.request).toHaveProperty('query');
        expect(actual.request).toHaveProperty('headers');
        expect(actual.request).toHaveProperty('body');
      });
    });

    describe('query type', () => {
      const request = {
        body: { id: 1, name: 'Test', due: 'tomorrow' },
        headers: { 'Content-Type': 'application/json' },
        method: HTTPMethods.GET,
        path: '/search',
        query: {},
      };

      it('is passed with matcher', () => {
        request.query = term({
          generate: 'limit=50&status=finished&order=desc',
          matcher: '^limit=[0-9]+&status=(finished)&order=(desc|asc)$',
        });
        expect(
          new Interaction().uponReceiving('request').withRequest(request).state
            .request,
        ).toHaveProperty('query');
      });

      it('is passed with matcher as the value', () => {
        request.query = {
          'id[]': eachLike('1'),
        };
        expect(
          new Interaction().uponReceiving('request').withRequest(request).state
            .request,
        ).toHaveProperty('query');
      });

      it('is passed with object', () => {
        request.query = {
          id: '1',
        };
        expect(
          new Interaction().uponReceiving('request').withRequest(request).state
            .request,
        ).toHaveProperty('query');
      });

      it('is passed with array', () => {
        request.query = {
          id: ['1', '2'],
        };
        expect(
          new Interaction().uponReceiving('request').withRequest(request).state
            .request?.query,
        ).toEqual({ id: ['1', '2'] });
      });
    });

    describe('request body', () => {
      it('is included when an empty string is specified', () => {
        const actual = new Interaction().uponReceiving('request').withRequest({
          body: '',
          method: HTTPMethods.GET,
          path: '/path',
        }).state;

        expect(actual.request).toHaveProperty('body');
      });

      it('is not included when explicitly set to undefined', () => {
        const actual = new Interaction().uponReceiving('request').withRequest({
          body: undefined,
          method: HTTPMethods.GET,
          path: '/path',
        } as unknown as RequestOptions).state;

        expect(actual.request).not.toHaveProperty('body');
      });
    });
  });

  describe('#willRespondWith', () => {
    let interaction: Interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('throws error when status is not provided', () => {
      expect(
        interaction.willRespondWith.bind(
          interaction,
          {} as unknown as ResponseOptions,
        ),
      ).toThrow('You must provide a status code.');
    });

    it('throws error when status is blank', () => {
      expect(
        interaction.willRespondWith.bind(interaction, {
          status: '',
        } as unknown as ResponseOptions),
      ).toThrow('You must provide a status code.');
    });

    describe('with only mandatory params', () => {
      let actual: InteractionState;

      beforeEach(() => {
        interaction.uponReceiving('request');
        interaction.willRespondWith({ status: 200 });
        actual = interaction.state;
      });

      it('has a state compacted with only present keys', () => {
        expect(actual).toHaveProperty('response');
        expect(actual.response).toHaveProperty('status');
      });

      it('request has no other keys', () => {
        expect(actual.response).not.toHaveProperty('headers');
        expect(actual.response).not.toHaveProperty('body');
      });
    });

    describe('with all other parameters', () => {
      let actual: InteractionState;

      beforeEach(() => {
        interaction.uponReceiving('request');
        interaction.willRespondWith({
          body: { id: 1, name: 'Test', due: 'tomorrow' },
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        });
        actual = interaction.state;
      });

      it('has a full state all available keys', () => {
        expect(actual).toHaveProperty('response');
        expect(actual.response).toHaveProperty('status');
        expect(actual.response).toHaveProperty('headers');
        expect(actual.response).toHaveProperty('body');
      });
    });

    describe('response body', () => {
      it('is included when an empty string is specified', () => {
        interaction.uponReceiving('request').willRespondWith({
          body: '',
          status: 204,
        });

        const actual = interaction.state;
        expect(actual.response).toHaveProperty('body');
      });

      it('is not included when explicitly set to undefined', () => {
        interaction.uponReceiving('request').willRespondWith({
          body: undefined,
          status: 204,
        } as unknown as ResponseOptions);

        const actual = interaction.state;
        expect(actual.response).not.toHaveProperty('body');
      });
    });
  });
});
