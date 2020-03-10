import { XmlNode } from "./xmlNode"
import { XmlText } from "./xmlText"

type XmlAttributes = Map<string, string>

type Callback = (n: XmlElement) => void

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

  public appendElement(
    name: string,
    attributes: XmlAttributes,
    cb?: Callback
  ): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes)
    this.executeCallback(el, cb)
    this.children.push(el)

    return this
  }

  public appendText(content: string): XmlElement {
    this.children.push(new XmlText(content))

    return this
  }

  public eachLike(
    name: string,
    attributes: XmlAttributes,
    cb?: Callback,
    options: EachLikeOptions = { examples: 1 }
  ): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes)
    this.executeCallback(el, cb)
    this.children.push({
      "pact:matcher:type": "type",
      value: el,
      examples: options.examples,
    })

    return this
  }

  private executeCallback(el: XmlElement, cb?: Callback) {
    if (cb) {
      cb(el)
    }
  }
}

interface EachLikeOptions {
  min?: number
  max?: number
  examples?: number
}
