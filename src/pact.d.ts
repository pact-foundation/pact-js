import {InteractionObject} from "./dsl/interaction";
import * as _Matchers from "./dsl/matchers";
import {PactfileWriteMode} from "./dsl/mockService";
import _Verifier = require("./dsl/verifier");

declare function pact(opts: pact.PactOptions): pact.PactProvider;

declare namespace pact {
  export interface PactOptions {
    consumer: string;
    provider: string;
    port?: number;
    host?: string;
    ssl?: boolean;
    sslcert?: string;
    sslkey?: string;
    dir?: string;
    log?: string;
    logLevel?: string;
    spec?: number;
    cors?: boolean;
    pactfileWriteMode?: PactfileWriteMode;
  }

  export interface PactProvider {
    setup(): Promise<void>;
    addInteraction(interactionObj: InteractionObject): Promise<string>;
    verify(): Promise<void>;
    finalize(): Promise<void>;
    writePact(): Promise<string>;
    removeInteractions(): Promise<string>;
  }

  export const Matchers: typeof _Matchers;
  export const Verifier: typeof _Verifier;
}

export = pact;
