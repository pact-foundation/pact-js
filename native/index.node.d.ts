import { VerifierV3Options } from "v3"
import {
  PactV3Options,
  V3MockServer,
  V3ProviderState,
  V3Request,
  V3Response
} from "v3/pact"
import { AnyTemplate } from "v3/matchers"

export class Pact {
  constructor(
    consumer: string,
    provider: string,
    pactJsVersion: string,
    opts: Omit<PactV3Options, "consumer" | "provider" | "dir">
  )
  addRequest(
    req: V3Request,
    body: AnyTemplate | undefined
  ): void
  addInteraction(desc: string, states: V3ProviderState[]): void
  addRequestBinaryFile(req: V3Request, contentType: string, file: string): void
  addRequestMultipartFileUpload(
    req: V3Request,
    contentType: string,
    file: string,
    part: string
  ): void
  addResponse(
    res: V3Response,
    body: AnyTemplate | undefined
  ): void

  addResponseBinaryFile(
    res: V3Response,
    contentType: string,
    file: string
  ): void
  addResponseMultipartFileUpload(
    req: V3Response,
    contentType: string,
    file: string,
    part: string
  ): void
  executeTest<T>(
    testFn: (mockServer: V3MockServer) => Promise<T>,
    opts: PactV3Options
  ): PactExecutionResult<T>
  getTestResult(id: string): PactTestResult
  writePactFile(id: string, opts: PactV3Options): void
  shutdownTest(result: PactExecutionResult<unknown>): void
}

export type MismatchRequest = Omit<V3Request, "query" | "body"> & {
  query?: Record<string, Array<string>>
  body?: string
}

export interface MismatchDetail {
  actualBody?: string
  expectedBody?: string
  actual?: string
  expected?: string
  key?: string
  mismatch?: string
  type?: string
}

export interface Mismatch {
  path?: string
  method?: string
  type: string
  request?: MismatchRequest
  mismatches?: Array<MismatchDetail>
}

export interface PactTestResult {
  mockServerError: string
  mockServerMismatches: string[] // This is the array of Mismatches, but it needs to be parsed
}
export interface PactExecutionResult<T> {
  testResult: Promise<T>
  mockServer: {
    id: string
  }
  testError: string
}

export function verify_provider(
  options: VerifierV3Options,
  cb: (err: unknown, val: unknown) => void // What types are these?
): void
export function init(): string
export function generate_datetime_string(format: string): string

export function generate_regex_string(source: string): string
