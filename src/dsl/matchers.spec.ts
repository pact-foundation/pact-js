/* tslint:disable:no-unused-expression no-empty object-literal-sort-keys */
import * as chai from "chai";
const expect = require("chai").expect;
import { Interaction } from "./interaction";
import {
  boolean, decimal, eachLike, hexadecimal,
  integer, ipv4Address, ipv6Address, ISO8601_DATE_FORMAT, iso8601Date,
  iso8601DateTime, iso8601DateTimeWithMillis, iso8601Time, rfc3339Timestamp, somethingLike, term, uuid,
  validateExample,
  extractPayload,
  isMatcher,
} from "./matchers";
import { json } from "express";

describe("Matcher", () => {

  describe("#validateExample", () => {
    describe("when given a valid regex", () => {
      describe("and a matching example", () => {
        it("should return true", () => {
          expect(validateExample("2010-01-01", ISO8601_DATE_FORMAT)).to.eql(true);
        });
      });
      describe("and a failing example", () => {
        it("should return false", () => {
          expect(validateExample("not a date", ISO8601_DATE_FORMAT)).to.eql(false);
        });
      });
    });
    describe("when given an invalid regex", () => {
      it("should return an error", () => {
        expect(() => {
          validateExample("", "abc(");
        }).to.throw(Error);
      });
    });
  });

  describe("#term", () => {
    describe("when given a valid regular expression and example", () => {
      it("should return a serialized Ruby object", () => {
        const expected = {
          data: {
            generate: "myawesomeword",
            matcher: {
              json_class: "Regexp",
              o: 0,
              s: "\\w+",
            },
          },
          json_class: "Pact::Term",
        };

        const match = term({
          generate: "myawesomeword",
          matcher: "\\w+",
        });

        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when not provided with a valid expression", () => {
      const createTheTerm = (badArg: any) => {
        return () => {
          term(badArg);
        };
      };

      describe("when no term is provided", () => {
        it("should throw an Error", () => {
          expect(createTheTerm.call({})).to.throw(Error);
        });
      });

      describe("when an invalid term is provided", () => {
        it("should throw an Error", () => {
          expect(createTheTerm({})).to.throw(Error);
          expect(createTheTerm("")).to.throw(Error);
          expect(createTheTerm({ generate: "foo" })).to.throw(Error);
          expect(createTheTerm({ matcher: "\\w+" })).to.throw(Error);
        });
      });
    });

    describe("when given an example that doesn't match the regular expression", () => {
      it("should fail with an error", () => {
        expect(() => {
          term({
            generate: "abc",
            matcher: ISO8601_DATE_FORMAT,
          });
        }).to.throw(Error);
      });
    });
  });

  describe("#somethingLike", () => {
    describe("when provided a value", () => {
      it("should return a serialized Ruby object", () => {
        const expected = {
          contents: "myspecialvalue",
          json_class: "Pact::SomethingLike",
        };

        const match = somethingLike("myspecialvalue");
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when not provided with a valid value", () => {
      const createTheValue = (badArg: any) => {
        return () => {
          somethingLike(badArg);
        };
      };

      describe("when no value is provided", () => {
        it("`should throw an Error", () => {
          expect(createTheValue.call({})).to.throw(Error);
        });
      });

      describe("when an invalid value is provided", () => {
        it("should throw an Error", () => {
          expect(createTheValue(undefined)).to.throw(Error);
          expect(createTheValue(() => { })).to.throw(Error);
        });
      });
    });
  });

  describe("#eachLike", () => {
    describe("when content is null", () => {
      it("should provide null as contents", () => {
        const expected = {
          contents: null,
          json_class: "Pact::ArrayLike",
          min: 1,
        };

        const match = eachLike(null, { min: 1 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when an object is provided", () => {
      it("should provide the object as contents", () => {
        const expected = {
          contents: { a: 1 },
          json_class: "Pact::ArrayLike",
          min: 1,
        };

        const match = eachLike({ a: 1 }, { min: 1 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when object.min is invalid", () => {
      it("should throw an error message", () => {
        expect(() => {
          eachLike({ a: 1 }, { min: 0 });
        }).to.throw(Error);
      });
    });

    describe("when an array is provided", () => {
      it("should provide the array as contents", () => {
        const expected = {
          contents: [1, 2, 3],
          json_class: "Pact::ArrayLike",
          min: 1,
        };

        const match = eachLike([1, 2, 3], { min: 1 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when a value is provided", () => {
      it("should add the value in contents", () => {
        const expected = {
          contents: "test",
          json_class: "Pact::ArrayLike",
          min: 1,
        };

        const match = eachLike("test", { min: 1 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("when the content has Pact.Macters", () => {
      describe("of type somethingLike", () => {
        it("should nest somethingLike correctly", () => {
          const expected = {
            contents: {
              id: {
                contents: 10,
                json_class: "Pact::SomethingLike",
              },
            },
            json_class: "Pact::ArrayLike",
            min: 1,
          };

          const match = eachLike({ id: somethingLike(10) }, { min: 1 });
          expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
        });
      });

      describe("of type term", () => {
        it("should nest term correctly", () => {
          const expected = {
            contents: {
              colour: {
                data: {
                  generate: "red",
                  matcher: {
                    json_class: "Regexp",
                    o: 0,
                    s: "red|green",
                  },
                },
                json_class: "Pact::Term",
              },
            },
            json_class: "Pact::ArrayLike",
            min: 1,
          };

          const match = eachLike({
            colour: term({
              generate: "red",
              matcher: "red|green",
            }),
          }, { min: 1 });

          expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
        });
      });

      describe("of type eachLike", () => {
        it("should nest eachlike in contents", () => {
          const expected = {
            contents: {
              contents: "blue",
              json_class: "Pact::ArrayLike",
              min: 1,
            },
            json_class: "Pact::ArrayLike",
            min: 1,
          };

          const match = eachLike(eachLike("blue", { min: 1 }), { min: 1 });
          expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
        });
      });

      describe("complex object with multiple Pact.Matchers", () => {
        it("should nest objects correctly", () => {
          const expected = {
            contents: {
              contents: {
                colour: {
                  data: {
                    generate: "red",
                    matcher: {
                      json_class: "Regexp",
                      o: 0,
                      s: "red|green|blue",
                    },
                  },
                  json_class: "Pact::Term",
                },
                size: {
                  contents: 10,
                  json_class: "Pact::SomethingLike",
                },
                tag: {
                  contents: [
                    {
                      contents: "jumper",
                      json_class: "Pact::SomethingLike",
                    },
                    {
                      contents: "shirt",
                      json_class: "Pact::SomethingLike",
                    },
                  ],
                  json_class: "Pact::ArrayLike",
                  min: 2,
                },
              },
              json_class: "Pact::ArrayLike",
              min: 1,
            },
            json_class: "Pact::ArrayLike",
            min: 1,
          };

          const match = eachLike(
            eachLike({
              colour: term({ generate: "red", matcher: "red|green|blue" }),
              size: somethingLike(10),
              tag: eachLike([
                somethingLike("jumper"),
                somethingLike("shirt"),
              ], { min: 2 }),
            }, { min: 1 }),
            { min: 1 });

          expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
        });
      });
    });

    describe("When no options.min is not provided", () => {
      it("should default to a min of 1", () => {
        const expected = {
          contents: { a: 1 },
          json_class: "Pact::ArrayLike",
          min: 1,
        };

        const match = eachLike({ a: 1 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });

    describe("When a options.min is provided", () => {
      it("should provide the object as contents", () => {
        const expected = {
          contents: { a: 1 },
          json_class: "Pact::ArrayLike",
          min: 3,
        };

        const match = eachLike({ a: 1 }, { min: 3 });
        expect(JSON.stringify(match)).to.deep.include(JSON.stringify(expected));
      });
    });
  });

  describe("#uuid", () => {
    describe("when given a valid UUID", () => {
      it("should not fail", () => {
        expect(uuid("ce118b6e-d8e1-11e7-9296-cec278b6b50a")).to.be.an("object");
        expect(uuid()).to.be.an("object");
      });
    });
    describe("when given an invalid UUID", () => {
      it("should return an error", () => {
        expect(() => {
          uuid("abc");
        }).to.throw(Error);
      });
    });
  });

  describe("#ipv4Address", () => {
    describe("when given a valid ipv4Address", () => {
      it("should not fail", () => {
        expect(ipv4Address("127.0.0.1")).to.be.an("object");
        expect(ipv4Address()).to.be.an("object");
      });
    });
    describe("when given an invalid ipv4Address", () => {
      it("should return an error", () => {
        expect(() => {
          ipv4Address("abc");
        }).to.throw(Error);
      });
    });
  });

  describe("#ipv6Address", () => {
    describe("when given a valid ipv6Address", () => {
      it("should not fail", () => {
        expect(ipv6Address("::1")).to.be.an("object");
        expect(ipv6Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).to.be.an("object");
        expect(ipv6Address()).to.be.an("object");
      });
    });
    describe("when given an invalid ipv6Address", () => {
      it("should return an error", () => {
        expect(() => {
          ipv6Address("abc");
        }).to.throw(Error);
      });
    });
  });

  describe("#hexadecimal", () => {
    describe("when given a valid hexadecimal", () => {
      it("should not fail", () => {
        expect(hexadecimal("6F")).to.be.an("object");
        expect(hexadecimal()).to.be.an("object");
      });
    });
    describe("when given an invalid hexadecimal", () => {
      it("should return an error", () => {
        expect(() => {
          hexadecimal("x1");
        }).to.throw(Error);
      });
    });
  });

  describe("#boolean", () => {
    describe("when used it should create a JSON object", () => {
      it("should not fail", () => {
        expect(boolean()).to.be.an("object");
      });
    });
  });

  describe("#decimal", () => {
    describe("when given a valid decimal", () => {
      it("should not fail", () => {
        expect(decimal(10.1)).to.be.an("object");
        expect(decimal()).to.be.an("object");
      });
    });
  });

  describe("#integer", () => {
    describe("when given a valid integer", () => {
      it("should not fail", () => {
        expect(integer(10)).to.be.an("object");
        expect(integer()).to.be.an("object");
      });
    });
  });

  describe("Date Matchers", () => {
    describe("#rfc3339Timestamp", () => {
      describe("when given a valid rfc3339Timestamp", () => {
        it("should not fail", () => {
          expect(rfc3339Timestamp("Mon, 31 Oct 2016 15:21:41 -0400")).to.be.an("object");
          expect(rfc3339Timestamp()).to.be.an("object");
        });
      });
      describe("when given an invalid rfc3339Timestamp", () => {
        it("should return an error", () => {
          expect(() => {
            rfc3339Timestamp("abc");
          }).to.throw(Error);
        });
      });
    });

    describe("#iso8601Time", () => {
      describe("when given a valid iso8601Time", () => {
        it("should not fail", () => {
          expect(iso8601Time("T22:44:30.652Z")).to.be.an("object");
          expect(iso8601Time()).to.be.an("object");
        });
      });
      describe("when given an invalid iso8601Time", () => {
        it("should return an error", () => {
          expect(() => {
            iso8601Time("abc");
          }).to.throw(Error);
        });
      });
    });

    describe("#iso8601Date", () => {
      describe("when given a valid iso8601Date", () => {
        it("should not fail", () => {
          expect(iso8601Date("2017-12-05")).to.be.an("object");
          expect(iso8601Date()).to.be.an("object");
        });
      });
      describe("when given an invalid iso8601Date", () => {
        it("should return an error", () => {
          expect(() => {
            iso8601Date("abc");
          }).to.throw(Error);
        });
      });
    });

    describe("#iso8601DateTime", () => {
      describe("when given a valid iso8601DateTime", () => {
        it("should not fail", () => {
          expect(iso8601DateTime("2015-08-06T16:53:10+01:00")).to.be.an("object");
          expect(iso8601DateTime()).to.be.an("object");
        });
      });
      describe("when given an invalid iso8601DateTime", () => {
        it("should return an error", () => {
          expect(() => {
            iso8601DateTime("abc");
          }).to.throw(Error);
        });
      });
    });

    describe("#iso8601DateTimeWithMillis", () => {
      describe("when given a valid iso8601DateTimeWithMillis", () => {
        it("should not fail", () => {
          expect(iso8601DateTimeWithMillis("2015-08-06T16:53:10.123+01:00")).to.be.an("object");
          expect(iso8601DateTimeWithMillis()).to.be.an("object");
        });
      });
      describe("when given an invalid iso8601DateTimeWithMillis", () => {
        it("should return an error", () => {
          expect(() => {
            iso8601DateTimeWithMillis("abc");
          }).to.throw(Error);
        });
      });
    });

    describe("#extractPayload", () => {
      describe("when given a simple matcher", () => {
        it("should remove all matching guff", () => {
          const expected = "myawesomeword";

          const matcher = term({
            generate: "myawesomeword",
            matcher: "\\w+",
          });

          expect(isMatcher(matcher)).to.eq(true);
          expect(extractPayload(matcher)).to.eql(expected);

        });
      });
      describe("when given a complex nested object with matchers", () => {
        it.only("should remove all matching guff", () => {
          const o = somethingLike({
            stringMatcher: {
              awesomeSetting: somethingLike("a string"),
            },
            anotherStringMatcher: {
              nestedSetting: {
                anotherStringMatcherSubSetting: somethingLike(true),
              },
              anotherSetting: term({ generate: "this", matcher: "this|that" }),
            },
            arrayMatcher: {
              lotsOfValues: eachLike("useful", { min: 3 }),
            },
            arrayOfMatchers: {
              lotsOfValues: eachLike(
                {
                  foo: "bar",
                  baz: somethingLike("bat"),
                }, { min: 3 }),
            },
          });

          const expected = {
            stringMatcher: {
              awesomeSetting: "a string",
            },
            anotherStringMatcher: {
              nestedSetting: {
                anotherStringMatcherSubSetting: true,
              },
              anotherSetting: "this",
            },
            arrayMatcher: {
              lotsOfValues: ["useful", "useful", "useful"],
            },
            arrayOfMatchers: {
              lotsOfValues: [
                {
                  baz: "bat",
                  foo: "bar",
                },
                {
                  baz: "bat",
                  foo: "bar",
                },
                {
                  baz: "bat",
                  foo: "bar",
                },
              ],
            },
          };

          expect(extractPayload(o)).to.deep.eql(expected);
        });
      });
    });
  });
});
