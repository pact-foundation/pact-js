import { XmlElement } from './xmlElement';

/**
 * XML Builder class for constructing XML documents with matchers
 */
export class XmlBuilder {
  private root: XmlElement;

  constructor(
    private version: string,
    private charset: string,
    rootElement: string
  ) {
    this.root = new XmlElement(rootElement);
  }

  public build(callback: (doc: XmlElement) => void): string {
    callback(this.root);

    return JSON.stringify(this);
  }
}
