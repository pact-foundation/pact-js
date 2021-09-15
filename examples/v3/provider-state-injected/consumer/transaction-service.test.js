const path = require('path');
const transactionService = require('./transaction-service');
const { PactV3, MatchersV3, XmlBuilder } = require('@pact-foundation/pact/v3');
const { expect } = require('chai');
const { string, integer, url2, regex, datetime, fromProviderState } =
  MatchersV3;

describe('Transaction service - create a new transaction for an account', () => {
  const provider = new PactV3({
    consumer: 'TransactionService',
    provider: 'AccountService',
    dir: path.resolve(process.cwd(), 'pacts'),
  });

  it('queries the account service for the account details', () => {
    provider
      .given('Account Test001 exists', { accountRef: 'Test001' })
      .uponReceiving('a request to get the account details')
      .withRequest({
        method: 'GET',
        path: '/accounts/search/findOneByAccountNumberId',
        query: { accountNumber: fromProviderState('${accountNumber}', '100') },
        headers: { Accept: 'application/hal+json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/hal+json' },
        body: {
          id: integer(1),
          version: integer(0),
          name: string('Test'),
          accountRef: string('Test001'),
          createdDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          lastModifiedDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          accountNumber: {
            id: fromProviderState('${accountNumber}', 100),
          },
          _links: {
            self: {
              href: url2('http://localhost:8080', [
                'accounts',
                regex('\\d+', '100'),
              ]),
            },
            account: {
              href: url2('http://localhost:8080', [
                'accounts',
                regex('\\d+', '100'),
              ]),
            },
          },
        },
      });

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url);
      return transactionService
        .createTransaction(100, 100000)
        .then((result) => {
          expect(result.account.accountNumber).to.equal(100);
          expect(result.transaction.amount).to.equal(100000);
        });
    });
  });

  // Uncomment when https://github.com/pact-foundation/pact-reference/issues/116 is resolved
  it('queries the account service for the account details using POST body', () => {
    provider
      .given('Account Test001 exists', { accountRef: 'Test001' })
      .uponReceiving('a request to get the account details via POST')
      .withRequest({
        method: 'POST',
        path: '/accounts/search/findOneByAccountNumberIdInBody',
        body: { accountNumber: fromProviderState('${accountNumber}', 100) },
        headers: {
          Accept: 'application/hal+json',
          'Content-Type': 'application/json',
        },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/hal+json' },
        body: {
          id: integer(1),
          version: integer(0),
          name: string('Test'),
          accountRef: string('Test001'),
          createdDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          lastModifiedDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          accountNumber: {
            id: fromProviderState('${accountNumber}', 100),
          },
          _links: {
            self: {
              href: url2('http://localhost:8080', [
                'accounts',
                regex('\\d+', '100'),
              ]),
            },
            account: {
              href: url2('http://localhost:8080', [
                'accounts',
                regex('\\d+', '100'),
              ]),
            },
          },
        },
      });

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url);
      return transactionService
        .createTransactionWithPostBody(100, 100000)
        .then((result) => {
          expect(result.account.accountNumber).to.equal(100);
          expect(result.transaction.amount).to.equal(100000);
        });
    });
  });

  // MatchersV3.fromProviderState on body
  it('test text data', () => {
    provider
      .given('set id', { id: '42' })
      .uponReceiving('a request to get the plain data')
      .withRequest({
        method: 'GET',
        path: MatchersV3.fromProviderState('/data/${id}', '/data/42'),
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: MatchersV3.fromProviderState(
          'data: testData, id: ${id}',
          'data: testData, id: 42'
        ),
      });

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url);
      return transactionService.getText(42).then((result) => {
        expect(result.data).to.equal('data: testData, id: 42');
      });
    });
  });

  // MatchersV3.string doesn't work within XmlBuilder with namespaced xml
  it('test xml data', () => {
    provider
      .given('set id', { id: '52' })
      .uponReceiving('a request to get the plain data')
      .withRequest({
        method: 'GET',
        path: MatchersV3.fromProviderState('/data/xml/${id}', '/data/42'),
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        body: new XmlBuilder('1.0', '', 'root').build((root) => {
          root.setAttributes({ 'xmlns:h': 'http://www.w3.org/TR/html4/' });
          root.appendElement('data', '', (data) => {
            data
              .appendElement('h:data', '', MatchersV3.string('random'))
              .appendElement(
                'id',
                '',
                MatchersV3.fromProviderState('${id}', '42')
              );
          });
        }),
      });

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url);
      return transactionService.getXml(42).then((result) => {
        expect(result.data).to.equal(
          `<?xml version='1.0'?><root xmlns:h='http://www.w3.org/TR/html4/'><data><h:data>random</h:data><id>42</id></data></root>`
        );
      });
    });
  });
});
