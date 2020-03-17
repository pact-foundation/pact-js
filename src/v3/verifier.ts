import { isEmpty } from "ramda"
import ConfigurationError from "../errors/configurationError"

const PactNative = require("../native")

export interface VerifierV3Options {
  provider: string
  logLevel: string
  providerBaseUrl: string
  pactUrls?: string[]
  pactBrokerUrl?: string
  providerStatesSetupUrl?: string
  pactBrokerUsername?: string
  pactBrokerPassword?: string
  pactBrokerToken?: string
  consumerVersionTag?: string | string[]
  providerVersionTag?: string | string[]
  customProviderHeaders?: string[]
  publishVerificationResult?: boolean
  providerVersion?: string
  tags?: string[]
  requestFilter?: (req: any) => any

  // stateHandlers: {
  //   "Has no animals": () => {
  //     animalRepository.clear()
  //     token = "1234"
  //     return Promise.resolve(`Animals removed to the db`)
  //   },
  //   "Has some animals": () => {
  //     token = "1234"
  //     importData()
  //     return Promise.resolve(`Animals added to the db`)
  //   },
  //   "Has an animal with ID 1": () => {
  //     token = "1234"
  //     importData()
  //     return Promise.resolve(`Animals added to the db`)
  //   },
  //   "is not authenticated": () => {
  //     token = ""
  //     Promise.resolve(`Invalid bearer token generated`)
  //   },
  // },
}

export class VerifierV3 {
  private config: VerifierV3Options

  constructor(config: VerifierV3Options) {
    this.config = config
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isEmpty(this.config)) {
        reject(new ConfigurationError("No configuration provided to verifier"))
      }
      if (!this.config.provider) {
        reject(new ConfigurationError("Provider name is required"))
      }
      if (isEmpty(this.config.pactUrls) && !this.config.pactBrokerUrl) {
        reject(
          new ConfigurationError(
            "Either a list of pactUrls or a pactBrokerUrl must be provided"
          )
        )
      }

      try {
        PactNative.verify_provider(this.config, (err: any, val: any) => {
          console.log("===========>", err, val)
          if (err || !val) {
            reject(err)
          } else {
            resolve(val)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}
