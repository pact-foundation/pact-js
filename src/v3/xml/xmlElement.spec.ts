import * as chai from 'chai';
import { describe } from 'mocha';
import { XmlText } from './xmlText';
import { XmlElement } from './xmlElement';
import * as MatchersV3 from '../matchers';
import { Matcher } from '../types';

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
      expect(xml.children, 'children of XML element').to.be.lengthOf(2);
      expect(
        xml.children[0],
        'type of first child of XML element'
      ).to.be.instanceOf(XmlText);
      expect(xml.children[0], 'first child of XML element').to.have.property(
        'content'
      );
      expect(
        (xml.children[0] as XmlText).content,
        'content of first child'
      ).to.equal('some string');
      expect(xml.children[0], 'first child of XML element').to.have.property(
        'matcher'
      );
      expect((xml.children[0] as XmlText).matcher, 'matcher of the first child')
        .to.be.undefined;
    });

    it('can be called with a Matcher', () => {
      const xml = new XmlElement('my name')
        .appendText(MatchersV3.string('string matcher'))
        .appendText(MatchersV3.regex(/^.*$/, 'regex matcher'))
        .appendText(
          MatchersV3.date(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z'
          )
        )
        .appendText(
          MatchersV3.datetime(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z'
          )
        )
        .appendText(
          MatchersV3.timestamp(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z'
          )
        )
        .appendText(
          MatchersV3.time(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z'
          )
        )
        .appendText(MatchersV3.uuid('adc214d3-1c9f-460d-b6c8-8f2bc8911860'));
      expect(xml, 'XML element').to.have.property('name');
      expect(xml.name, 'name of XML element').to.equal('my name');

      expect(xml, 'XML element').to.have.property('children');
      expect(xml.children, 'children of XML element').to.be.lengthOf(7);
      for (let i = 0; i < 7; i += 1) {
        const child: XmlText = xml.children[i] as XmlText;
        expect(child).to.be.instanceOf(XmlText);
        expect(child).to.have.property('content');
        expect(child.content).not.to.be.empty;
        expect(child.content).to.be.a('string');
        expect(child).to.have.property('matcher');
        expect(child.matcher).to.have.property('value');
        expect(child.matcher?.value).to.be.a('string');
        expect(child.matcher?.value).not.to.be.empty;
        expect(child.matcher).to.have.property('pact:matcher:type');
        expect(child.matcher?.['pact:matcher:type']).to.be.a('string');
        expect(child.matcher?.['pact:matcher:type']).not.to.be.empty;
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
      expect(xml.children, 'children of XML element').to.be.lengthOf(1);
      const child: XmlText = xml.children[0] as XmlText;
      expect(child).to.be.instanceOf(XmlText);
      expect(child).to.have.property('content');
      expect(child.content).to.be.empty;
      expect(child.content).to.be.a('string');
      expect(child).to.have.property('matcher');
      expect(child.matcher).not.to.have.property('value');
      expect(child.matcher).to.have.property('pact:matcher:type');
      expect(child.matcher?.['pact:matcher:type']).to.be.a('string');
      expect(child.matcher?.['pact:matcher:type']).not.to.be.empty;
    });
  });
});
