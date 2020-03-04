import { XmlElement } from "./xmlElement"

export class XmlBuilder {
  private root: XmlElement

  constructor(private version: string, private charset: string, rootElement: string) {
    this.root = new XmlElement(rootElement)
  }

  public build(callback: (doc: XmlElement) => any) {
    callback(this.root)

    return this
  }
}
