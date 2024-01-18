'use strict';

const { pactWith } = require('jest-pact');
const { Matchers } = require('@pact-foundation/pact');

const { getMeDogs, getMeCats } = require('../index');
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

pactWith(
  {
    consumer: 'Jest-Consumer-Example',
    provider: 'Jest-Provider-Example',
    logLevel: LOG_LEVEL,
    pactfileWriteMode: 'merge',
  },
  (provider) => {
    describe('Dogs API', () => {
      const DOGS_DATA = [
        {
          dog: 1,
        },
      ];

      const dogsSuccessResponse = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: DOGS_DATA,
      };

      const dogsListRequest = {
        uponReceiving: 'a request for dogs',
        withRequest: {
          method: 'GET',
          path: '/dogs',
          headers: {
            Accept: 'application/json',
          },
        },
      };

      beforeEach(() => {
        const interaction = {
          state: 'i have a list of dogs',
          ...dogsListRequest,
          willRespondWith: dogsSuccessResponse,
        };
        return provider.addInteraction(interaction);
      });

      // add expectations
      it('returns a successful body', () => {
        return getMeDogs({
          url: provider.mockService.baseUrl,
        }).then((dogs) => {
          expect(dogs).toEqual(DOGS_DATA);
        });
      });
    });

  }
);
pactWith(
  {
    consumer: 'Jest-Consumer-Example',
    provider: 'Jest-Provider-Example',
    logLevel: LOG_LEVEL,
    pactfileWriteMode: 'merge',
  },
  (provider) => {
    describe('Cats API', () => {
      const CATS_DATA = [{ cat: 2 }, { cat: 3 }];

      const catsSuccessResponse = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: CATS_DATA,
      };

      const numberMatcher = Matchers.term({
        generate: 1,
        matcher: '[0-9]+',
      });

      const catsListRequest = {
        uponReceiving: 'a request for cats with given catId',
        withRequest: {
          method: 'GET',
          path: '/cats',
          query: {
            'catId[]': [numberMatcher, numberMatcher],
            // 'catId[]': [2, 3] // Alternative
            // TODO: fix when https://github.com/pact-foundation/pact-reference/issues/205 is merged
            // 'catId[]': Matchers.eachLike('1'),
          },
          headers: {
            Accept: 'application/json',
          },
        },
      };

      beforeEach(() => {
        return provider.addInteraction({
          state: 'i have a list of cats',
          ...catsListRequest,
          willRespondWith: catsSuccessResponse,
        });
      });

      it('returns a successful body', () => {
        return getMeCats({
          url: provider.mockService.baseUrl,
        }).then((cats) => {
          expect(cats).toEqual(CATS_DATA);
        });
      });
    });
  }
);
