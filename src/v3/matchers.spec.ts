import * as mockery from "mockery"
const MockNative = {
  
}
mockery.registerMock("../native", MockNative)

import * as chai from "chai"
import * as matchers from "./matchers"

const expect = chai.expect

describe("V3 Matchers", () => {
  describe("#like", () => {
    it("returns a JSON representation of a like matcher", () => {
      let result = matchers.like({
        a: 'b'
      })
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: {
          a: "b"
        }
      })
    })
  })

  describe("#eachLike", () => {
    it("returns a JSON representation of an eachLike matcher", () => {
      let result = matchers.eachLike({
        a: 'b'
      })
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: [{
          a: "b"
        }]
      })
    })
  })

  describe("#atLeastOneLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atLeastOneLike matcher", () => {
        let result = matchers.atLeastOneLike({
          a: 'b'
        })
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 1,
          value: [{
            a: "b"
          }]
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atLeastOneLike matcher with the correct number of examples", () => {
        let result = matchers.atLeastOneLike({
          a: 'b'
        }, 4)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 1,
          "value": [{"a": "b"}, {"a": "b"}, {"a": "b"}, {"a": "b"}]
        })
      })
    })
  })

  describe("#atLeastLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atLeastLike matcher", () => {
        let result = matchers.atLeastLike({
          a: 'b'
        }, 2)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          value: [{a: "b"}, {a: "b"}]
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atLeastLike matcher with the correct number of examples", () => {
        let result = matchers.atLeastLike({
          a: 'b'
        }, 2, 4)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          "value": [{"a": "b"}, {"a": "b"}, {"a": "b"}, {"a": "b"}]
        })
      })
    })

    it("throws an error if the number of examples is less than the minimum", () => {
      expect(() => matchers.atLeastLike({a: 'b'}, 4, 2)).to.throw("atLeastLike has a minimum of 4 but 2 elements where requested. Make sure the count is greater than or equal to the min.")
    })
  })

  describe("#atMostLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atMostLike matcher", () => {
        let result = matchers.atMostLike({
          a: 'b'
        }, 2)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          max: 2,
          value: [{a: "b"}]
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atMostLike matcher with the correct number of examples", () => {
        let result = matchers.atMostLike({
          a: 'b'
        }, 4, 4)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          max: 4,
          "value": [{"a": "b"}, {"a": "b"}, {"a": "b"}, {"a": "b"}]
        })
      })
    })

    it("throws an error if the number of examples is more than the maximum", () => {
      expect(() => matchers.atMostLike({a: 'b'}, 2, 4)).to.throw("atMostLike has a maximum of 2 but 4 elements where requested. Make sure the count is less than or equal to the max.")
    })
  })

  describe("#constrainedArrayLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an constrainedArrayLike matcher", () => {
        let result = matchers.constrainedArrayLike({
          a: 'b'
        }, 2, 4)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          max: 4,
          value: [{a: "b"}, {a: "b"}]
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an constrainedArrayLike matcher with the correct number of examples", () => {
        let result = matchers.constrainedArrayLike({
          a: 'b'
        }, 2, 4, 3)
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          max: 4,
          "value": [{"a": "b"}, {"a": "b"}, {"a": "b"}]
        })
      })
    })

    it("throws an error if the number of examples is less than the minimum", () => {
      expect(() => matchers.constrainedArrayLike({a: 'b'}, 4, 6, 2)).to.throw("constrainedArrayLike has a minimum of 4 but 2 elements where requested. Make sure the count is greater than or equal to the min.")
    })

    it("throws an error if the number of examples is more than the maximum", () => {
      expect(() => matchers.constrainedArrayLike({a: 'b'}, 4, 6, 8)).to.throw("constrainedArrayLike has a maximum of 6 but 8 elements where requested. Make sure the count is less than or equal to the max.")
    })
  })

  describe("#integer", () => {
    it("returns a JSON representation of an integer matcher", () => {
      let result = matchers.integer(100)
      expect(result).to.deep.equal({
        "pact:matcher:type": "integer",
        value: 100
      })
    })

    describe("when no example is given", () => {
      it("also includes a random integer generator", () => {
        let result = matchers.integer()
        expect(result).to.deep.equal({
          "pact:matcher:type": "integer",
          "pact:generator:type": "RandomInt",
          value: 101
        })
      })
    })
  })

  describe("#decimal", () => {
    it("returns a JSON representation of an decimal matcher", () => {
      let result = matchers.decimal(100.3)
      expect(result).to.deep.equal({
        "pact:matcher:type": "decimal",
        value: 100.3
      })
    })

    describe("when no example is given", () => {
      it("also includes a random decimal generator", () => {
        let result = matchers.decimal()
        expect(result).to.deep.equal({
          "pact:matcher:type": "decimal",
          "pact:generator:type": "RandomDecimal",
          value: 12.34
        })
      })
    })
  })

  describe("#number", () => {
    it("returns a JSON representation of an number matcher", () => {
      let result = matchers.number(100.3)
      expect(result).to.deep.equal({
        "pact:matcher:type": "number",
        value: 100.3
      })
    })

    describe("when no example is given", () => {
      it("also includes a random integer generator", () => {
        let result = matchers.number()
        expect(result).to.deep.equal({
          "pact:matcher:type": "number",
          "pact:generator:type": "RandomInt",
          value: 1234
        })
      })
    })
  })

  describe("#boolean", () => {
    it("returns a JSON representation of a like matcher", () => {
      let result = matchers.boolean(true)
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: true
      })
    })
  })
})
