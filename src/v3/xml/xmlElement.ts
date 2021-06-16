import { Matcher } from '../matchers';
import { XmlNode } from './xmlNode';
import { XmlText } from './xmlText';

export type XmlAttributes = Map<string, string>;
export type XmlCallback = (n: XmlElement) => void;

const modifyElementWithCallback = (el: XmlElement, cb?: XmlCallback) => {
  if (cb) {
    cb(el);
  }
};
export class XmlElement extends XmlNode {
  private attributes: XmlAttributes;

  private children: XmlNode[] = [];

  constructor(public name: string) {
    super();
  }

  public setName(name: string): XmlElement {
    this.name = name;

    return this;
  }

  public setAttributes(attributes: XmlAttributes): XmlElement {
    this.attributes = attributes;

    return this;
  }

  /**
   * Creates a new element with the given name and attributes and then sets it's text content (can be a matcher)
   * @param name Element name
   * @param attributes Map of element attributes
   * @param arg Callback to configure the new element, or text content to create the new element with (can be a matcher)
   */
  public appendElement(
    name: string,
    attributes: XmlAttributes,
    arg?: string | XmlCallback | Matcher<string>
  ): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes);
    if (arg) {
      if (typeof arg !== 'function') {
        el.appendText(arg);
      } else {
        modifyElementWithCallback(el, arg);
      }
    }
    this.children.push(el);

    return this;
  }

  public appendText(content: string | Matcher<string>): XmlElement {
    if (typeof content === 'object' && content['pact:matcher:type']) {
      this.children.push(
        new XmlText(
          (content as Matcher<string>).value || '',
          content as Matcher<string>
        )
      );
    } else {
      this.children.push(new XmlText(content.toString()));
    }
    return this;
  }

  public eachLike(
    name: string,
    attributes: XmlAttributes,
    cb?: XmlCallback,
    options: EachLikeOptions = { examples: 1 }
  ): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes);
    modifyElementWithCallback(el, cb);
    this.children.push({
      'pact:matcher:type': 'type',
      value: el,
      examples: options.examples,
    });

    return this;
  }
}

interface EachLikeOptions {
  min?: number;
  max?: number;
  examples?: number;
}
