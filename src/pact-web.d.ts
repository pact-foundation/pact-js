import { InteractionObject } from "./dsl/interaction";
import * as _Matchers from "./dsl/matchers";
import {PactfileWriteMode} from "./dsl/mockService";

declare function pact(opts: pact.PactWebOptions): pact.PactWebProvider;

declare namespace pact {
  export interface PactWebOptions {
    consumer: string;
    provider: string;
    port?: number;
    host?: string;
    ssl?: boolean;
    pactfileWriteMode?: PactfileWriteMode;
  }

  export interface PactWebProvider {
    addInteraction(interactionObj: InteractionObject): Promise<string>;
    verify(): Promise<void>;
    finalize(): Promise<void>;
    writePact(): Promise<string>;
    removeInteractions(): Promise<string>;
  }

  export const Matchers: typeof _Matchers;
}

export = pact;
