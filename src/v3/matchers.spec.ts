import * as mockery from "mockery"
let MockNative = {
  generate_datetime_string: () => "",
  generate_regex_string: () => "",
}
mockery.registerMock("../native/index.node", MockNative)

import * as chai from "chai"
import { MatchersV3 } from "./matchers"

const expect = chai.expect

describe("V3 Matchers", () => {
  describe("#like", () => {
    it("returns a JSON representation of a like matcher", () => {
      let result = MatchersV3.like({
        a: "b",
      })
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: {
          a: "b",
        },
      })
    })
  })

  describe("#eachLike", () => {
    it("returns a JSON representation of an eachLike matcher", () => {
      let result = MatchersV3.eachLike({
        a: "b",
      })
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: [
          {
            a: "b",
          },
        ],
      })
    })
  })

  describe("#atLeastOneLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atLeastOneLike matcher", () => {
        let result = MatchersV3.atLeastOneLike({
          a: "b",
        })
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 1,
          value: [
            {
              a: "b",
            },
          ],
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atLeastOneLike matcher with the correct number of examples", () => {
        let result = MatchersV3.atLeastOneLike(
          {
            a: "b",
          },
          4
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 1,
          value: [{ a: "b" }, { a: "b" }, { a: "b" }, { a: "b" }],
        })
      })
    })
  })

  describe("#atLeastLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atLeastLike matcher", () => {
        let result = MatchersV3.atLeastLike(
          {
            a: "b",
          },
          2
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          value: [{ a: "b" }, { a: "b" }],
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atLeastLike matcher with the correct number of examples", () => {
        let result = MatchersV3.atLeastLike(
          {
            a: "b",
          },
          2,
          4
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          value: [{ a: "b" }, { a: "b" }, { a: "b" }, { a: "b" }],
        })
      })
    })

    it("throws an error if the number of examples is less than the minimum", () => {
      expect(() => MatchersV3.atLeastLike({ a: "b" }, 4, 2)).to.throw(
        "atLeastLike has a minimum of 4 but 2 elements where requested. Make sure the count is greater than or equal to the min."
      )
    })
  })

  describe("#atMostLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an atMostLike matcher", () => {
        let result = MatchersV3.atMostLike(
          {
            a: "b",
          },
          2
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          max: 2,
          value: [{ a: "b" }],
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an atMostLike matcher with the correct number of examples", () => {
        let result = MatchersV3.atMostLike(
          {
            a: "b",
          },
          4,
          4
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          max: 4,
          value: [{ a: "b" }, { a: "b" }, { a: "b" }, { a: "b" }],
        })
      })
    })

    it("throws an error if the number of examples is more than the maximum", () => {
      expect(() => MatchersV3.atMostLike({ a: "b" }, 2, 4)).to.throw(
        "atMostLike has a maximum of 2 but 4 elements where requested. Make sure the count is less than or equal to the max."
      )
    })
  })

  describe("#constrainedArrayLike", () => {
    describe("with no examples", () => {
      it("returns a JSON representation of an constrainedArrayLike matcher", () => {
        let result = MatchersV3.constrainedArrayLike(
          {
            a: "b",
          },
          2,
          4
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          max: 4,
          value: [{ a: "b" }, { a: "b" }],
        })
      })
    })

    describe("when provided examples", () => {
      it("returns a JSON representation of an constrainedArrayLike matcher with the correct number of examples", () => {
        let result = MatchersV3.constrainedArrayLike(
          {
            a: "b",
          },
          2,
          4,
          3
        )
        expect(result).to.deep.equal({
          "pact:matcher:type": "type",
          min: 2,
          max: 4,
          value: [{ a: "b" }, { a: "b" }, { a: "b" }],
        })
      })
    })

    it("throws an error if the number of examples is less than the minimum", () => {
      expect(() =>
        MatchersV3.constrainedArrayLike({ a: "b" }, 4, 6, 2)
      ).to.throw(
        "constrainedArrayLike has a minimum of 4 but 2 elements where requested. Make sure the count is greater than or equal to the min."
      )
    })

    it("throws an error if the number of examples is more than the maximum", () => {
      expect(() =>
        MatchersV3.constrainedArrayLike({ a: "b" }, 4, 6, 8)
      ).to.throw(
        "constrainedArrayLike has a maximum of 6 but 8 elements where requested. Make sure the count is less than or equal to the max."
      )
    })
  })

  describe("#integer", () => {
    it("returns a JSON representation of an integer matcher", () => {
      let result = MatchersV3.integer(100)
      expect(result).to.deep.equal({
        "pact:matcher:type": "integer",
        value: 100,
      })
    })

    describe("when no example is given", () => {
      it("also includes a random integer generator", () => {
        let result = MatchersV3.integer()
        expect(result).to.deep.equal({
          "pact:matcher:type": "integer",
          "pact:generator:type": "RandomInt",
          value: 101,
        })
      })
    })
  })

  describe("#decimal", () => {
    it("returns a JSON representation of an decimal matcher", () => {
      let result = MatchersV3.decimal(100.3)
      expect(result).to.deep.equal({
        "pact:matcher:type": "decimal",
        value: 100.3,
      })
    })

    describe("when no example is given", () => {
      it("also includes a random decimal generator", () => {
        let result = MatchersV3.decimal()
        expect(result).to.deep.equal({
          "pact:matcher:type": "decimal",
          "pact:generator:type": "RandomDecimal",
          value: 12.34,
        })
      })
    })
  })

  describe("#number", () => {
    it("returns a JSON representation of an number matcher", () => {
      let result = MatchersV3.number(100.3)
      expect(result).to.deep.equal({
        "pact:matcher:type": "number",
        value: 100.3,
      })
    })

    describe("when no example is given", () => {
      it("also includes a random integer generator", () => {
        let result = MatchersV3.number()
        expect(result).to.deep.equal({
          "pact:matcher:type": "number",
          "pact:generator:type": "RandomInt",
          value: 1234,
        })
      })
    })
  })

  describe("#boolean", () => {
    it("returns a JSON representation of a like matcher", () => {
      let result = MatchersV3.boolean(true)
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: true,
      })
    })
  })

  describe("#string", () => {
    it("returns a JSON representation of a like matcher", () => {
      let result = MatchersV3.string("true")
      expect(result).to.deep.equal({
        "pact:matcher:type": "type",
        value: "true",
      })
    })
  })

  describe("#regex", () => {
    it("returns a JSON representation of a regex matcher", () => {
      let result = MatchersV3.regex("\\d+", "1234")
      expect(result).to.deep.equal({
        "pact:matcher:type": "regex",
        regex: "\\d+",
        value: "1234",
      })
    })

    describe("when given a regular expression", () => {
      it("returns a JSON representation of a regex matcher", () => {
        let result = MatchersV3.regex(/\d+/, "1234")
        expect(result).to.deep.equal({
          "pact:matcher:type": "regex",
          regex: "\\d+",
          value: "1234",
        })
      })
    })
  })

  describe("#equal", () => {
    it("returns a JSON representation of an equality matcher", () => {
      let result = MatchersV3.equal("true")
      expect(result).to.deep.equal({
        "pact:matcher:type": "equality",
        value: "true",
      })
    })
  })

  describe("#datetime", () => {
    it("returns a JSON representation of a datetime matcher", () => {
      let result = MatchersV3.datetime(
        "yyyy-MM-dd'T'HH:mm:ss.SSSX",
        "2016-02-11T09:46:56.023Z"
      )
      expect(result).to.deep.equal({
        "pact:generator:type": "DateTime",
        "pact:matcher:type": "timestamp",
        format: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
        value: "2016-02-11T09:46:56.023Z",
      })
    })

    describe("when no example is given", () => {
      it("generates a datetime from the current system time", () => {
        MockNative.generate_datetime_string = () => "2016-02-11T09:46:56.023Z"
        let result = MatchersV3.datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX")
        expect(result).to.deep.equal({
          "pact:generator:type": "DateTime",
          "pact:matcher:type": "timestamp",
          format: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
          value: "2016-02-11T09:46:56.023Z",
        })
      })
    })
  })

  describe("#time", () => {
    it("returns a JSON representation of a time matcher", () => {
      let result = MatchersV3.time("HH:mm:ss", "09:46:56")
      expect(result).to.deep.equal({
        "pact:generator:type": "Time",
        "pact:matcher:type": "time",
        format: "HH:mm:ss",
        value: "09:46:56",
      })
    })

    describe("when no example is given", () => {
      it("generates a time from the current system time", () => {
        MockNative.generate_datetime_string = () => "10:46:56.023"
        let result = MatchersV3.time("HH:mm:ss.SSS")
        expect(result).to.deep.equal({
          "pact:generator:type": "Time",
          "pact:matcher:type": "time",
          format: "HH:mm:ss.SSS",
          value: "10:46:56.023",
        })
      })
    })
  })

  describe("#date", () => {
    it("returns a JSON representation of a date matcher", () => {
      let result = MatchersV3.date("yyyy-MM-dd", "2016-02-11")
      expect(result).to.deep.equal({
        "pact:generator:type": "Date",
        "pact:matcher:type": "date",
        format: "yyyy-MM-dd",
        value: "2016-02-11",
      })
    })

    describe("when no example is given", () => {
      it("generates a date from the current system time", () => {
        MockNative.generate_datetime_string = () => "2020-02-11"
        let result = MatchersV3.date("yyyy-MM-dd")
        expect(result).to.deep.equal({
          "pact:generator:type": "Date",
          "pact:matcher:type": "date",
          format: "yyyy-MM-dd",
          value: "2020-02-11",
        })
      })
    })
  })

  describe("#includes", () => {
    it("returns a JSON representation of an include matcher", () => {
      let result = MatchersV3.includes("true")
      expect(result).to.deep.equal({
        "pact:matcher:type": "include",
        value: "true",
      })
    })
  })

  describe("#nullValue", () => {
    it("returns a JSON representation of an null matcher", () => {
      let result = MatchersV3.nullValue()
      expect(result).to.deep.equal({
        "pact:matcher:type": "null",
      })
    })
  })

  describe("#url", () => {
    it("returns a JSON representation of a regex matcher for the URL", () => {
      let result = MatchersV3.url2("http://localhost:8080", [
        "users",
        "1234",
        "posts",
        "latest",
      ])
      expect(result).to.deep.equal({
        "pact:matcher:type": "regex",
        regex: ".*(\\/users\\/1234\\/posts\\/latest)$",
        value: "http://localhost:8080/users/1234/posts/latest",
      })
    })

    describe("when provided with a regex matcher", () => {
      it("returns a JSON representation of a regex matcher for the URL", () => {
        let result = MatchersV3.url2("http://localhost:8080", [
          "users",
          MatchersV3.regex("\\d+", "1234"),
          "posts",
          "latest",
        ])
        expect(result).to.deep.equal({
          "pact:matcher:type": "regex",
          regex: ".*(\\/users\\/\\d+\\/posts\\/latest)$",
          value: "http://localhost:8080/users/1234/posts/latest",
        })
      })
    })

    describe("when provided with a regular expression", () => {
      it("returns a JSON representation of a regex matcher for the URL", () => {
        MockNative.generate_regex_string = () => "12345678"
        let result = MatchersV3.url2("http://localhost:8080", [
          "users",
          /\d+/,
          "posts",
          "latest",
        ])
        expect(result).to.deep.equal({
          "pact:matcher:type": "regex",
          regex: ".*(\\/users\\/\\d+\\/posts\\/latest)$",
          value: "http://localhost:8080/users/12345678/posts/latest",
        })
      })
    })

    describe("when no base URL is provided", () => {
      it("returns regex matcher and a MockServerURL generator", () => {
        let result = MatchersV3.url([
          "users",
          MatchersV3.regex("\\d+", "1234"),
          "posts",
          "latest",
        ])
        expect(result).to.deep.equal({
          "pact:matcher:type": "regex",
          "pact:generator:type": "MockServerURL",
          regex: ".*(\\/users\\/\\d+\\/posts\\/latest)$",
          value: "http://localhost:8080/users/1234/posts/latest",
          example: "http://localhost:8080/users/1234/posts/latest",
        })
      })
    })
  })

  describe("#uuid", () => {
    it("returns a JSON representation of an regex matcher for UUIDs", () => {
      let result = MatchersV3.uuid("ba4bd1bc-5556-11eb-9286-d71bc5b507be")
      expect(result).to.deep.equal({
        "pact:matcher:type": "regex",
        regex: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        value: "ba4bd1bc-5556-11eb-9286-d71bc5b507be",
      })
    })

    it("throws an exception if the example value does not match the UUID regex", () => {
      expect(() => MatchersV3.uuid("not a uuid")).to.throw()
      expect(() => MatchersV3.uuid("ba4bd1bc-5556-11eb-9286")).to.throw()
      expect(() =>
        MatchersV3.uuid("ba4bd1bc-5556-11eb-9286-d71bc5b507be-1234")
      ).to.throw()
    })

    it("if no example is provided, it sets up a generator", () => {
      let result = MatchersV3.uuid()
      expect(result).to.deep.equal({
        "pact:matcher:type": "regex",
        "pact:generator:type": "Uuid",
        regex: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        value: "e2490de5-5bd3-43d5-b7c4-526e33f71304",
      })
    })
  })
})
