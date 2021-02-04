import { Test } from "@nestjs/testing"
import { PactVerifierService } from "nestjs-pact"
import { INestApplication, Logger, LoggerService } from "@nestjs/common"
import { AppModule } from "../src/app.module"
import { AppRepository } from "../src/app.repository"
import { PactModule } from "./pact/pact.module"

jest.setTimeout(30000)

describe("Pact Verification", () => {
  let verifier: PactVerifierService
  let logger: LoggerService
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, PactModule],
      providers: [AppRepository, Logger],
    }).compile()

    verifier = moduleRef.get(PactVerifierService)
    logger = moduleRef.get(Logger)

    app = moduleRef.createNestApplication()

    await app.init()
  })

  it("Validates the expectations of 'Matching Service'", async () => {
    const output = await verifier.verify(app)

    logger.log("Pact Verification Complete!")
    logger.log(output)
  })

  afterAll(async () => {
    await app.close()
  })
})
