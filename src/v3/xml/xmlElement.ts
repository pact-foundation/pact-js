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

  /**
   * Creates a new element with the given name and attributes and then invokes the callback to configure it.
   * @param name Element name
   * @param attributes Map of element attributes
   * @param arg Callback to configure the new element
   */
  public appendElement(
    name: string,
    attributes: XmlAttributes,
    arg?: Callback
  ): XmlElement
  /**
   * Creates a new element with the given name and attributes and then sets it's text content (can be a matcher)
   * @param name Element name
   * @param attributes Map of element attributes
   * @param arg Text content to create the new element with (can be a matcher)
   */
  public appendElement(
    name: string,
    attributes: XmlAttributes,
    arg?: string
  ): XmlElement
  public appendElement(
    name: string,
    attributes: XmlAttributes,
    arg?: any
  ): XmlElement {
    const el = new XmlElement(name).setAttributes(attributes)
    if (arg) {
      if (typeof arg != "function") {
        el.appendText(arg)
      } else {
        this.executeCallback(el, arg)
      }
    }
    this.children.push(el)

    return this
  }

  public appendText(content: string): XmlElement
  public appendText(content: any): XmlElement {
    if (typeof context == "string") {
      this.children.push(new XmlText(content))
    } else if (content["pact:matcher:type"]) {
      this.children.push(new XmlText(content["value"], content))
    } else {
      this.children.push(new XmlText(content.toString()))
    }
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
