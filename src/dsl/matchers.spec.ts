import * as chai from 'chai';
const expect = require('chai').expect;
import { Interaction } from './interaction';
import { term, somethingLike, eachLike } from './matchers';

describe('Matcher', () => {

  describe('#term', () => {
    describe('when provided a term', () => {
      it('should return a serialized Ruby object', () => {
        const expected = {
          'json_class': 'Pact::Term',
          'data': {
            'generate': 'myawesomeword',
            'matcher': {
              'json_class': 'Regexp',
              'o': 0,
              's': '\\w+'
            }
          }
        };

        const match = term({
          generate: 'myawesomeword',
          matcher: '\\w+'
        });

        expect(match).to.eql(expected);
      });
    });

    describe('when not provided with a valid term', () => {
      const createTheTerm = function (badArg: any) {
        return () => {
          term(badArg);
        };
      };

      describe('when no term is provided', () => {
        it.skip('should throw an Error', () => {
          // expect(createTheTerm()).to.throw(Error)
        });
      });

      describe('when an invalid term is provided', () => {
        it('should throw an Error', () => {
          expect(createTheTerm({})).to.throw(Error);
          expect(createTheTerm('')).to.throw(Error);
          expect(createTheTerm({ generate: 'foo' })).to.throw(Error);
          expect(createTheTerm({ matcher: '\\w+' })).to.throw(Error);
        });
      });
    });
  });

  describe('#somethingLike', () => {
    describe('when provided a value', () => {
      it('should return a serialized Ruby object', () => {
        const expected = {
          'json_class': 'Pact::SomethingLike',
          'contents': 'myspecialvalue'
        };

        const match = somethingLike('myspecialvalue');
        expect(match).to.eql(expected);
      });
    });

    describe('when not provided with a valid value', () => {
      const createTheValue = function (badArg: any) {
        return () => {
          somethingLike(badArg);
        };
      };

      describe('when no value is provided', () => {
        it.skip('`should throw an Error', () => {
          // expect(createTheValue()).to.throw(Error)
        });
      });

      describe('when an invalid value is provided', () => {
        it('should throw an Error', () => {
          expect(createTheValue(undefined)).to.throw(Error);
          expect(createTheValue(() => { })).to.throw(Error);
        });
      });
    });
  });

  describe('#eachLike', () => {
    describe('when content is null', () => {
      it('should provide null as contents', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': null,
          'min': 1
        };

        const match = eachLike(null, { min: 1 });
        expect(match).to.eql(expected);
      });
    });

    describe('when an object is provided', () => {
      it('should provide the object as contents', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': { a: 1 },
          'min': 1
        };

        const match = eachLike({ a: 1 }, { min: 1 });
        expect(match).to.eql(expected);
      });
    });

    describe('when object.min is invalid', () => {
      it('should throw an error message', () => {
        expect(() => {
          eachLike({ a: 1 }, { min: 0 })
        }).to.throw(Error);
      });
    });

    describe('when an array is provided', () => {
      it('should provide the array as contents', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': [1, 2, 3],
          'min': 1
        };

        const match = eachLike([1, 2, 3], { min: 1 });
        expect(match).to.eql(expected);
      });
    });

    describe('when a value is provided', () => {
      it('should add the value in contents', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': 'test',
          'min': 1
        };

        const match = eachLike('test', { min: 1 });
        expect(match).to.eql(expected);
      });
    });

    describe('when the content has Pact.Macters', () => {
      describe('of type somethingLike', () => {
        it('should nest somethingLike correctly', () => {
          const expected = {
            'json_class': 'Pact::ArrayLike',
            'contents': {
              'id': {
                'json_class': 'Pact::SomethingLike',
                'contents': 10
              }
            },
            'min': 1
          };

          const match = eachLike({ id: somethingLike(10) }, { min: 1 });
          expect(match).to.eql(expected);
        });
      });

      describe('of type term', () => {
        it('should nest term correctly', () => {
          const expected = {
            'json_class': 'Pact::ArrayLike',
            'contents': {
              'colour': {
                'json_class': 'Pact::Term',
                'data': {
                  'generate': 'red',
                  'matcher': {
                    'json_class': 'Regexp',
                    'o': 0,
                    's': 'red|green'
                  }
                }
              }
            },
            'min': 1
          };

          const match = eachLike({
            colour: term({
              generate: 'red',
              matcher: 'red|green'
            })
          }, { min: 1 });

          expect(match).to.eql(expected);
        });
      });

      describe('of type eachLike', () => {
        it('should nest eachlike in contents', () => {
          const expected = {
            'json_class': 'Pact::ArrayLike',
            'contents': {
              'json_class': 'Pact::ArrayLike',
              'contents': 'blue',
              'min': 1
            },
            'min': 1
          }

          const match = eachLike(eachLike('blue', { min: 1 }), { min: 1 });
          expect(match).to.eql(expected);
        });
      });

      describe('complex object with multiple Pact.Matchers', () => {
        it('should nest objects correctly', () => {
          const expected = {
            'json_class': 'Pact::ArrayLike',
            'contents': {
              'json_class': 'Pact::ArrayLike',
              'contents': {
                'size': {
                  'json_class': 'Pact::SomethingLike',
                  'contents': 10
                },
                'colour': {
                  'json_class': 'Pact::Term',
                  'data': {
                    'generate': 'red',
                    'matcher': {
                      'json_class': 'Regexp',
                      'o': 0,
                      's': 'red|green|blue'
                    }
                  }
                },
                'tag': {
                  'json_class': 'Pact::ArrayLike',
                  'contents': [
                    {
                      'json_class': 'Pact::SomethingLike',
                      'contents': 'jumper'
                    },
                    {
                      'json_class': 'Pact::SomethingLike',
                      'contents': 'shirt'
                    }
                  ],
                  'min': 2
                }
              },
              'min': 1
            },
            'min': 1
          };

          const match = eachLike(
            eachLike({
              size: somethingLike(10),
              colour: term({ generate: 'red', matcher: 'red|green|blue' }),
              tag: eachLike([
                somethingLike('jumper'),
                somethingLike('shirt')
              ], { min: 2 })
            }, { min: 1 }),
            { min: 1 });

          expect(match).to.eql(expected);
        });
      });
    });

    describe('When no options.min is not provided', () => {
      it('should default to a min of 1', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': { a: 1 },
          'min': 1
        }

        const match = eachLike({ a: 1 })
        expect(match).to.eql(expected)
      })
    })

    describe('When a options.min is provided', () => {
      it('should provide the object as contents', () => {
        const expected = {
          'json_class': 'Pact::ArrayLike',
          'contents': { a: 1 },
          'min': 3
        };

        const match = eachLike({ a: 1 }, { min: 3 });
        expect(match).to.eql(expected);
      });
    });
  });
});
