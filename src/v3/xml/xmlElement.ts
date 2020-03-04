import { XmlNode } from "./xmlNode"
import { XmlText } from "./xmlText"

type XmlAttributes = Map<string, string>

export class XmlElement extends XmlNode {
  private attributes: XmlAttributes
  private children: XmlNode[] = []

  constructor(public name: string) {
    super()
  }

  public setName(name: string): XmlElement {
    this.name = name

    return this
  }

  public setAttributes(attributes: XmlAttributes): XmlElement {
    this.attributes = attributes

    return this
  }

  public appendElement(name: string, attributes: XmlAttributes, callback: (n: XmlElement) => void): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes)
    callback(el)
    this.children.push(el)

    return this
  }

  public appendText(content: string): XmlElement {
    this.children.push(new XmlText(content))

    return this
  }

  public eachLike(name: string, attributes: XmlAttributes, callback: (n: XmlElement) => void): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes)
    callback(el)
    this.children.push({ "pact:matcher:type": "type", value: el })

    return this
  }
}
