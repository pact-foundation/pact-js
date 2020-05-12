/* tslint:disable:no-unused-expression no-empty no-string-literal*/
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"

import { Publisher } from "./publisher"
chai.use(chaiAsPromised)

const expect = chai.expect

describe("Publisher", () => {
  describe("#constructor", () => {
    it("constructs a valid Pubisher class", () => {
      const p = new Publisher({
        consumerVersion: "1.0.0",
        pactBroker: "http://foo.com",
        pactFilesOrDirs: [],
      })
      expect(p).to.have.nested.property("opts.consumerVersion")
    })
  })
})
