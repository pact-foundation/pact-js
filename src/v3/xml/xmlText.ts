import { Matcher } from 'v3/matchers';
import { XmlNode } from './xmlNode';

export class XmlText extends XmlNode {
  constructor(private content: string, private matcher?: Matcher<string>) {
    super();
  }
}
