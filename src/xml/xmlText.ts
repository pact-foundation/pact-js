import type { Matcher } from '../v3/types';
import { XmlNode } from './xmlNode';

export class XmlText extends XmlNode {
  constructor(
    public content: string,
    public matcher?: Matcher<string>,
  ) {
    super();
  }
}
