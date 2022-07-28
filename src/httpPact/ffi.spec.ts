// @ts-nocheck
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { contentTypeFromHeaders, setQuery } from './ffi';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact FFI', () => {
  describe('#contentTypeFromHeaders', () => {
    ['content-type', 'Content-Type', 'CONTent-TYPE'].forEach((t) => {
      describe(`when the "${t}" header is set`, () => {
        it('detects the content type from the header', () => {
          const headers = { [t]: 'some-mime-type' };
          expect(contentTypeFromHeaders(headers, 'application/json')).to.eq(
            'some-mime-type'
          );
        });
      });
    });

    describe(`when the no content-type header is set`, () => {
      it('uses a default', () => {
        expect(contentTypeFromHeaders({}, 'application/json')).to.eq(
          'application/json'
        );
      });
    });
  });

  describe('#setQuery', () => {
    describe('with array values', () => {
      it('calls the query ffi function for each value', () => {
        const queryMock = sinon.stub();

        const interaction = {
          withQuery: queryMock,
        };
        const query = {
          foo: ['bar', 'baz'],
        };
        setQuery(interaction, query);
        expect(queryMock.calledTwice);
        expect(queryMock.calledWith('foo', 0, 'bar'));
        expect(queryMock.calledWith('foo', 1, 'baz'));
      });
    });
    describe('with single values', () => {
      it('calls the query ffi function for each value', () => {
        const queryMock = sinon.stub();

        const interaction = {
          withQuery: queryMock,
        };
        const query = {
          foo: 'bar',
        };
        setQuery(interaction, query);
        expect(queryMock.calledOnce);
        expect(queryMock.calledWith('foo', 0, 'bar'));
      });
    });
    describe('with array and single values', () => {
      it('calls the query ffi function for each value', () => {
        const queryMock = sinon.stub();

        const interaction = {
          withQuery: queryMock,
        };
        const query = {
          foo: 'bar',
          baz: ['bat', 'foo'],
        };
        setQuery(interaction, query);
        expect(queryMock.calledThrice);
        expect(queryMock.calledWith('foo', 0, 'bar'));
        expect(queryMock.calledWith('baz', 0, 'bat'));
        expect(queryMock.calledWith('baz', 1, 'foo'));
      });
    });
  });
});
