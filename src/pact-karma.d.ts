import {InteractionObject} from "./dsl/interaction";
import * as _Matchers from "./dsl/matchers";

declare function pact(opts: pact.PactKarmaOptions): pact.PactKarmaProvider;

declare namespace pact {
  export interface PactKarmaOptions {
    consumer: string;
    provider: string;
    port?: number;
    host?: string;
    ssl?: boolean;
  }

  export interface PactKarmaProvider {
    addInteraction(interactionObj: InteractionObject): Promise<string>;
    verify(): Promise<void>;
    finalize(): Promise<void>;
    writePact(): Promise<string>;
    removeInteractions(): Promise<string>;
  }

  export const Matchers: typeof _Matchers;
}

export = pact;
