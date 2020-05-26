import { XmlNode } from "./xmlNode"

export class XmlText extends XmlNode {
  constructor(private content: string, private matcher?: any) {
    super()
  }
}
