const path = require('path');
const transactionService = require('./transaction-service');
const { PactV3, MatchersV3, XmlBuilder } = require('@pact-foundation/pact/v3');
const { expect } = require('chai');
const { string, integer, url2, regex, datetime, fromProviderState } =
  MatchersV3;

describe.skip('Transaction service - create a new transaction for an account', () => {
  const provider = new PactV3({
    consumer: 'TransactionService',
    provider: 'AccountService',
    logLevel: 'trace',
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
          createdDate: datetime(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            '2017-12-04T14:47:18.582Z'
          ),
          lastModifiedDate: datetime(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            '2017-12-04T14:47:18.582Z'
          ),
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
          createdDate: datetime(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            '2017-12-04T14:47:18.582Z'
          ),
          lastModifiedDate: datetime(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            '2017-12-04T14:47:18.582Z'
          ),
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

  it('test text data', () => {
    provider
      .given('set id', { id: '42' })
      .uponReceiving('a request to get the plain data')
      .withRequest({
        method: 'GET',
        path: fromProviderState('/data/${id}', '/data/42'),
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        // This test never would have worked - fromProviderState generators don't work on response bodies
        // The point of fromProviderState is to give the provider the opportunity to update an incoming request
        // but this is the provider's response, which they have f ull control over
        body: 'data: testData, id: 42',
        contentType: 'text/plain',
      });

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url);
      const result = await transactionService.getText(42);
      expect(result.data).to.equal('data: testData, id: 42');
    });
  });

  // string doesn't work within XmlBuilder with namespaced xml
  //
  // TODO: was this ever passing??? (referring to comment above, but this test is failing)
  //   a request to get the xml data
  //     returns a response which
  //       has status code 200 (OK)
  //       includes headers
  //         "Content-Type" with value "application/xml; charset=utf-8" (OK)
  //       has a matching body (FAILED)

  // Failures:

  // 1) Verifying a pact between TransactionService and AccountService Given set id - a request to get the xml data
  //     1.1) has a matching body
  //            $.root.data.id['#text'] -> Expected '42' to be equal to '52'
  //            $.root.data['http://www.w3.org/TR/html4/:data']['#text'] -> Expected 'random' to be equal to 'testData'
  //
  // Actual response:
  //
  //    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n  <root xmlns:h=\"http://www.w3.org/TR/html4/\">\n      <data>\n          <h:data>testData</h:data>\n          <id>52</id>\n      </data>\n  </root>
  it.skip('test xml data', () => {
    provider
      .given('set id', { id: '52' })
      .uponReceiving('a request to get the xml data')
      .withRequest({
        method: 'GET',
        path: fromProviderState('/data/xml/${id}', '/data/xml/42'),
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        body: new XmlBuilder('1.0', '', 'root').build((root) => {
          root.setAttributes({ 'xmlns:h': 'http://www.w3.org/TR/html4/' });
          root.appendElement('data', '', (data) => {
            data
              .appendElement('h:data', '', string('random'))
              .appendElement('id', '', fromProviderState('${id}', '42'));
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
