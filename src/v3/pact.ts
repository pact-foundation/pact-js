import logger from "../common/logger"
const PactNative = require("../native")

export interface PactV3Options {
  dir: string
  consumer: string
  provider: string
}

export interface V3ProviderState {
  description: string
  parameters?: any
}

export interface V3Request {
  method: string
  path: string
  query?: {
    [param: string]: string
  }
  headers?: {
    [header: string]: string
  }
  body?: any
}

export interface V3Response {
  status: number
  headers?: {
    [header: string]: string
  }
  body?: any
}

export interface V3MockServer {
  port: number
  url: string
  id: string
}

export class PactV3 {
  private opts: any
  private states: V3ProviderState[] = []
  private pact: any

  constructor(opts: PactV3Options & {}) {
    this.opts = opts
    this.pact = new PactNative.Pact(opts.consumer, opts.provider)
  }

  public given(providerState: string, parameters?: any) {
    this.states.push({ description: providerState, parameters })
    return this
  }

  public uponReceiving(desc: string) {
    this.pact.addInteraction(desc, this.states)
    return this
  }

  public withRequest(req: V3Request) {
    this.pact.addRequest(req, req.body && JSON.stringify(req.body))
    return this
  }

  public withRequestBinaryFile(
    req: V3Request,
    contentType: string,
    file: string
  ) {
    this.pact.addRequestBinaryFile(req, contentType, file)
    return this
  }

  public withRequestMultipartFileUpload(
    req: V3Request,
    contentType: string,
    file: string,
    part: string
  ) {
    this.pact.addRequestMultipartFileUpload(req, contentType, file, part)
    return this
  }

  public willRespondWith(res: V3Response) {
    this.pact.addResponse(res, res.body && JSON.stringify(res.body))
    this.states = []
    return this
  }

  public withResponseBinaryFile(
    res: V3Response,
    contentType: string,
    file: string
  ) {
    this.pact.addResponseBinaryFile(res, contentType, file)
    return this
  }

  public withResponseMultipartFileUpload(
    req: V3Response,
    contentType: string,
    file: string,
    part: string
  ) {
    this.pact.addResponseMultipartFileUpload(req, contentType, file, part)
    return this
  }

  public executeTest<T>(
    testFn: (mockServer: V3MockServer) => Promise<T>
  ): Promise<T> {
    const result = this.pact.executeTest(testFn)
    if (result.testResult) {
      return result.testResult
        .then((val: T) => {
          const testResult = this.pact.getTestResult(result.mockServer.id)
          if (testResult.mockServerError) {
            return Promise.reject(new Error(testResult.mockServerError))
          } else if (testResult.mockServerMismatches) {
            let error = "Mock server failed with the following mismatches: "
            for (const mismatch of testResult.mockServerMismatches) {
              error += "\n\t" + mismatch
            }
            return Promise.reject(new Error(error))
          } else {
            this.pact.writePactFile(result.mockServer.id, this.opts.dir)
            return val
          }
        })
        .catch((err: any) => {
          const testResult = this.pact.getTestResult(result.mockServer.id)
          let error = "Test failed for the following reasons:"
          error += "\n\n\tTest code failed with an error: " + err.message
          if (testResult.mockServerError) {
            error += "\n\n\t" + testResult.mockServerError
          }
          if (testResult.mockServerMismatches) {
            error += "\n\n\tMock server failed with the following mismatches: "
            let i = 1
            for (const mismatchJson of testResult.mockServerMismatches) {
              let mismatches = JSON.parse(mismatchJson)
              if (mismatches.mismatches) {
                for (const mismatch of mismatches.mismatches) {
                  error += `\n\t\t${i++}) ${mismatch.type} ${
                    mismatch.path ? `(at ${mismatch.path}) ` : ""
                  }${mismatch.mismatch}`
                }
              }
            }
          }
          return Promise.reject(new Error(error))
        })
        .finally(() => {
          this.pact.shutdownMockServer(result.mockServer)
        })
    } else {
      this.pact.shutdownMockServer(result.mockServer)
      return Promise.reject(result.testError)
    }
  }
}

interface RunningServer {
  pact: PactV3
  mockServer: V3MockServer
}

interface TestResult {
  mockServerError: string | null
  mockServerMismatches: string[] | null
}

export async function withMockServer<T>(
  testFn: (...mockServers: V3MockServer[]) => Promise<T>,
  ...pacts: PactV3[]
): Promise<T> {
  const runningServers: RunningServer[] = []

  try {
    pacts.forEach(pact => {
      runningServers.push({
        pact,
        mockServer: (pact as any).pact.startMockServer() as V3MockServer,
      })
    })

    const value = await testFn(
      ...runningServers.map(({ mockServer }) => mockServer)
    )

    const pactErrors = getTestResults(runningServers).filter(isError)

    if (pactErrors.length) {
      let message = "Mock server failed with the following mismatches: "
      for (const pactError of pactErrors) {
        message += formatPactErrorMessage(pactError)
      }
      throw new Error(message)
    }

    runningServers.forEach(({ pact, mockServer }) => {
      const nativePact = (pact as any).pact
      nativePact.writePactFile(mockServer.id, (pact as any).opts.dir)
    })

    return value
  } catch (err) {
    const pactErrors = getTestResults(runningServers).filter(isError)

    if (pactErrors.length) {
      let message = "Test failed for the following reasons:"
      message += "\n\n\tTest code failed with an error: " + err.message

      for (const pactError of pactErrors) {
        message += formatPactErrorMessage(pactError)
      }

      const newError = new Error(message)
      // 'Forward' original stack trace:
      newError.stack = err.stack
      throw newError
    }

    throw err
  } finally {
    runningServers.forEach(({ pact, mockServer }) => {
      ;(pact as any).pact.shutdownMockServer(mockServer)
    })
  }
}

function formatPactErrorMessage(testResult: TestResult): string {
  let message = ""
  if (testResult.mockServerError) {
    message += "\n\n\t" + testResult.mockServerError
  }
  if (testResult.mockServerMismatches) {
    message += "\n\n\tMock server failed with the following mismatches: "
    let i = 1
    for (const mismatchJson of testResult.mockServerMismatches) {
      let mismatches = JSON.parse(mismatchJson)
      if (mismatches.mismatches) {
        for (const mismatch of mismatches.mismatches) {
          message += `\n\t\t${i++}) ${mismatch.type} ${
            mismatch.path ? `(at ${mismatch.path}) ` : ""
          }${mismatch.mismatch}`
        }
      }
    }
  }

  return message
}

function isError(testResult: TestResult): boolean {
  return !!testResult.mockServerError || !!testResult.mockServerMismatches
}

function getTestResults(runningServers: RunningServer[]): TestResult[] {
  return runningServers.map(({ pact, mockServer }) =>
    (pact as any).pact.getTestResult(mockServer.id)
  )
}
