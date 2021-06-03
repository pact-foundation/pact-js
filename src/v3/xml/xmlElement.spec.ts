/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as chai from 'chai';
import { describe } from 'mocha';
import { XmlText } from './xmlText';
import { XmlElement } from './xmlElement';
import * as MatchersV3 from '../matchers';
import { Matcher } from '../matchers';

const { expect } = chai;

describe('xml element', () => {
  describe('appendText', () => {
    it('can be called with a string', () => {
      const xml = new XmlElement('my name')
        .appendText('some string')
        .appendText('second string');
      expect(xml, 'XML element').to.have.property('name');
      expect(xml.name, 'name of XML element').to.equal('my name');

      expect(xml, 'XML element').to.have.property('children');
      expect(xml['children'], 'children of XML element').to.be.lengthOf(2);
      expect(
        xml['children'][0],
        'type of first child of XML element'
      ).to.be.instanceOf(XmlText);
      expect(xml['children'][0], 'first child of XML element').to.have.property(
        'content'
      );
      // @ts-ignore
      expect(xml['children'][0]['content'], 'content of first child').to.equal(
        'some string'
      );
      expect(xml['children'][0], 'first child of XML element').to.have.property(
        'matcher'
      );
      // @ts-ignore
      expect(xml['children'][0]['matcher'], 'matcher of the first child').to.be
        .undefined;
    });

    it('can be called with a Matcher', () => {
      const xml = new XmlElement('my name')
        .appendText(MatchersV3.string('string matcher'))
        .appendText(MatchersV3.regex(/^.*$/, 'regex matcher'))
        .appendText(MatchersV3.date('yyyy-MM-dd HH:mm:ss.SSSX'))
        .appendText(MatchersV3.datetime('yyyy-MM-dd HH:mm:ss.SSSX'))
        .appendText(MatchersV3.timestamp('yyyy-MM-dd HH:mm:ss.SSSX'))
        .appendText(MatchersV3.time('yyyy-MM-dd HH:mm:ss.SSSX'))
        .appendText(MatchersV3.uuid('adc214d3-1c9f-460d-b6c8-8f2bc8911860'));
      expect(xml, 'XML element').to.have.property('name');
      expect(xml.name, 'name of XML element').to.equal('my name');

      expect(xml, 'XML element').to.have.property('children');
      expect(xml['children'], 'children of XML element').to.be.lengthOf(7);
      for (let i = 0; i < 7; i += 1) {
        expect(xml['children'][i]).to.be.instanceOf(XmlText);
        expect(xml['children'][i]).to.have.property('content');
        // @ts-ignore
        expect(xml['children'][i]['content']).not.to.be.empty;
        // @ts-ignore
        expect(xml['children'][i]['content']).to.be.a('string');
        expect(xml['children'][i]).to.have.property('matcher');
        // @ts-ignore
        expect(xml['children'][i]['matcher']).to.have.property('value');
        // @ts-ignore
        expect(xml['children'][i]['matcher']['value']).to.be.a('string');
        // @ts-ignore
        expect(xml['children'][i]['matcher']['value']).not.to.be.empty;
        // @ts-ignore
        expect(xml['children'][i]['matcher']).to.have.property(
          'pact:matcher:type'
        );
        // @ts-ignore
        expect(xml['children'][i]['matcher']['pact:matcher:type']).to.be.a(
          'string'
        );
        // @ts-ignore
        expect(xml['children'][i]['matcher']['pact:matcher:type']).not.to.be
          .empty;
      }
    });
    it('sets content to an empty string if the Matcher has no value', () => {
      function noValueMatcher(): Matcher<string> {
        return {
          'pact:matcher:type': 'no-value',
        };
      }
      const xml = new XmlElement('my name').appendText(noValueMatcher());
      expect(xml, 'XML element').to.have.property('name');
      expect(xml.name, 'name of XML element').to.equal('my name');

      expect(xml, 'XML element').to.have.property('children');
      expect(xml['children'], 'children of XML element').to.be.lengthOf(1);
      expect(xml['children'][0]).to.be.instanceOf(XmlText);
      expect(xml['children'][0]).to.have.property('content');
      // @ts-ignore
      expect(xml['children'][0]['content']).to.be.empty;
      // @ts-ignore
      expect(xml['children'][0]['content']).to.be.a('string');
      expect(xml['children'][0]).to.have.property('matcher');
      // @ts-ignore
      expect(xml['children'][0]['matcher']).not.to.have.property('value');
      // @ts-ignore
      expect(xml['children'][0]['matcher']).to.have.property(
        'pact:matcher:type'
      );
      // @ts-ignore
      expect(xml['children'][0]['matcher']['pact:matcher:type']).to.be.a(
        'string'
      );
      // @ts-ignore
      expect(xml['children'][0]['matcher']['pact:matcher:type']).not.to.be
        .empty;
    });
  });
});
