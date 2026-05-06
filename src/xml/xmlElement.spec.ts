import * as MatchersV3 from '../v3/matchers';
import type { Matcher } from '../v3/types';
import { XmlElement } from './xmlElement';
import { XmlText } from './xmlText';

describe('xml element', () => {
  describe('appendText', () => {
    it('can be called with a string', () => {
      const xml = new XmlElement('my name')
        .appendText('some string')
        .appendText('second string');
      expect(xml, 'XML element').toHaveProperty('name');
      expect(xml.name, 'name of XML element').toBe('my name');

      expect(xml, 'XML element').toHaveProperty('children');
      expect(xml.children, 'children of XML element').toHaveLength(2);
      expect(
        xml.children[0],
        'type of first child of XML element',
      ).toBeInstanceOf(XmlText);
      expect(xml.children[0], 'first child of XML element').toHaveProperty(
        'content',
      );
      expect(
        (xml.children[0] as XmlText).content,
        'content of first child',
      ).toBe('some string');
      expect(xml.children[0], 'first child of XML element').toHaveProperty(
        'matcher',
      );
      expect(
        (xml.children[0] as XmlText).matcher,
        'matcher of the first child',
      ).toBeUndefined();
    });

    it('can be called with a Matcher', () => {
      const xml = new XmlElement('my name')
        .appendText(MatchersV3.string('string matcher'))
        .appendText(MatchersV3.regex(/^.*$/, 'regex matcher'))
        .appendText(
          MatchersV3.date(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z',
          ),
        )
        .appendText(
          MatchersV3.datetime(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z',
          ),
        )
        .appendText(
          MatchersV3.timestamp(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z',
          ),
        )
        .appendText(
          MatchersV3.time(
            'yyyy-MM-dd HH:mm:ss.SSSX',
            '2016-02-11T09:46:56.023Z',
          ),
        )
        .appendText(MatchersV3.uuid('adc214d3-1c9f-460d-b6c8-8f2bc8911860'));
      expect(xml, 'XML element').toHaveProperty('name');
      expect(xml.name, 'name of XML element').toBe('my name');

      expect(xml, 'XML element').toHaveProperty('children');
      expect(xml.children, 'children of XML element').toHaveLength(7);
      for (let i = 0; i < 7; i += 1) {
        const child: XmlText = xml.children[i] as XmlText;
        expect(child).toBeInstanceOf(XmlText);
        expect(child).toHaveProperty('content');
        expect(child.content).not.toBe('');
        expect(child.content).toBeTypeOf('string');
        expect(child).toHaveProperty('matcher');
        expect(child.matcher).toHaveProperty('value');
        expect(child.matcher?.value).toBeTypeOf('string');
        expect(child.matcher?.value).not.toBe('');
        expect(child.matcher).toHaveProperty('pact:matcher:type');
        expect(child.matcher?.['pact:matcher:type']).toBeTypeOf('string');
        expect(child.matcher?.['pact:matcher:type']).not.toBe('');
      }
    });

    it('sets content to an empty string if the Matcher has no value', () => {
      function noValueMatcher(): Matcher<string> {
        return {
          'pact:matcher:type': 'no-value',
        };
      }
      const xml = new XmlElement('my name').appendText(noValueMatcher());
      expect(xml, 'XML element').toHaveProperty('name');
      expect(xml.name, 'name of XML element').toBe('my name');

      expect(xml, 'XML element').toHaveProperty('children');
      expect(xml.children, 'children of XML element').toHaveLength(1);
      const child: XmlText = xml.children[0] as XmlText;
      expect(child).toBeInstanceOf(XmlText);
      expect(child).toHaveProperty('content');
      expect(child.content).toBe('');
      expect(child.content).toBeTypeOf('string');
      expect(child).toHaveProperty('matcher');
      expect(child.matcher).not.toHaveProperty('value');
      expect(child.matcher).toHaveProperty('pact:matcher:type');
      expect(child.matcher?.['pact:matcher:type']).toBeTypeOf('string');
      expect(child.matcher?.['pact:matcher:type']).not.toBe('');
    });
  });
});
