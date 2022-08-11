import * as chai from 'chai';
import * as MatchersV3 from './matchers';

const { expect } = chai;

describe('V3 Matchers', () => {
  describe('#like', () => {
    it('returns a JSON representation of a like matcher', () => {
      const result = MatchersV3.like({
        a: 'b',
      });
      expect(result).to.deep.equal({
        'pact:matcher:type': 'type',
        value: {
          a: 'b',
        },
      });
    });
  });

  describe('#eachKeylike', () => {
    it('returns a JSON representation of an eachKeyLike matcher', () => {
      const result = MatchersV3.eachKeyLike('004', {
        id: '004',
      });
      expect(result).to.deep.equal({
        'pact:matcher:type': 'values',
        value: {
          '004': {
            id: '004',
          },
        },
      });
    });
  });

  describe('#eachLike', () => {
    it('returns a JSON representation of an eachLike matcher', () => {
      const result = MatchersV3.eachLike({
        a: 'b',
      });
      expect(result).to.deep.equal({
        'pact:matcher:type': 'type',
        value: [
          {
            a: 'b',
          },
        ],
      });
    });
  });

  describe('#atLeastOneLike', () => {
    describe('with no examples', () => {
      it('returns a JSON representation of an atLeastOneLike matcher', () => {
        const result = MatchersV3.atLeastOneLike({
          a: 'b',
        });
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 1,
          value: [
            {
              a: 'b',
            },
          ],
        });
      });
    });

    describe('when provided examples', () => {
      it('returns a JSON representation of an atLeastOneLike matcher with the correct number of examples', () => {
        const result = MatchersV3.atLeastOneLike(
          {
            a: 'b',
          },
          4
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 1,
          value: [{ a: 'b' }, { a: 'b' }, { a: 'b' }, { a: 'b' }],
        });
      });
    });
  });

  describe('#atLeastLike', () => {
    describe('with no examples', () => {
      it('returns a JSON representation of an atLeastLike matcher', () => {
        const result = MatchersV3.atLeastLike(
          {
            a: 'b',
          },
          2
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 2,
          value: [{ a: 'b' }, { a: 'b' }],
        });
      });
    });

    describe('when provided examples', () => {
      it('returns a JSON representation of an atLeastLike matcher with the correct number of examples', () => {
        const result = MatchersV3.atLeastLike(
          {
            a: 'b',
          },
          2,
          4
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 2,
          value: [{ a: 'b' }, { a: 'b' }, { a: 'b' }, { a: 'b' }],
        });
      });
    });

    it('throws an error if the number of examples is less than the minimum', () => {
      expect(() => MatchersV3.atLeastLike({ a: 'b' }, 4, 2)).to.throw(
        'atLeastLike has a minimum of 4 but 2 elements were requested. Make sure the count is greater than or equal to the min.'
      );
    });
  });

  describe('#atMostLike', () => {
    describe('with no examples', () => {
      it('returns a JSON representation of an atMostLike matcher', () => {
        const result = MatchersV3.atMostLike(
          {
            a: 'b',
          },
          2
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          max: 2,
          value: [{ a: 'b' }],
        });
      });
    });

    describe('when provided examples', () => {
      it('returns a JSON representation of an atMostLike matcher with the correct number of examples', () => {
        const result = MatchersV3.atMostLike(
          {
            a: 'b',
          },
          4,
          4
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          max: 4,
          value: [{ a: 'b' }, { a: 'b' }, { a: 'b' }, { a: 'b' }],
        });
      });
    });

    it('throws an error if the number of examples is more than the maximum', () => {
      expect(() => MatchersV3.atMostLike({ a: 'b' }, 2, 4)).to.throw(
        'atMostLike has a maximum of 2 but 4 elements where requested. Make sure the count is less than or equal to the max.'
      );
    });
  });

  describe('#constrainedArrayLike', () => {
    describe('with no examples', () => {
      it('returns a JSON representation of an constrainedArrayLike matcher', () => {
        const result = MatchersV3.constrainedArrayLike(
          {
            a: 'b',
          },
          2,
          4
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 2,
          max: 4,
          value: [{ a: 'b' }, { a: 'b' }],
        });
      });
    });

    describe('when provided examples', () => {
      it('returns a JSON representation of an constrainedArrayLike matcher with the correct number of examples', () => {
        const result = MatchersV3.constrainedArrayLike(
          {
            a: 'b',
          },
          2,
          4,
          3
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'type',
          min: 2,
          max: 4,
          value: [{ a: 'b' }, { a: 'b' }, { a: 'b' }],
        });
      });
    });

    it('throws an error if the number of examples is less than the minimum', () => {
      expect(() =>
        MatchersV3.constrainedArrayLike({ a: 'b' }, 4, 6, 2)
      ).to.throw(
        'constrainedArrayLike has a minimum of 4 but 2 elements where requested. Make sure the count is greater than or equal to the min.'
      );
    });

    it('throws an error if the number of examples is more than the maximum', () => {
      expect(() =>
        MatchersV3.constrainedArrayLike({ a: 'b' }, 4, 6, 8)
      ).to.throw(
        'constrainedArrayLike has a maximum of 6 but 8 elements where requested. Make sure the count is less than or equal to the max.'
      );
    });
  });

  describe('#integer', () => {
    it('returns a JSON representation of an integer matcher', () => {
      const result = MatchersV3.integer(100);
      expect(result).to.deep.equal({
        'pact:matcher:type': 'integer',
        value: 100,
      });
    });

    describe('when the example is zero', () => {
      it('returns a JSON representation of an integer matcher', () => {
        const result = MatchersV3.integer(0);
        expect(result).to.deep.equal({
          'pact:matcher:type': 'integer',
          value: 0,
        });
      });
    });

    describe('when no example is given', () => {
      it('also includes a random integer generator', () => {
        const result = MatchersV3.integer();
        expect(result).to.deep.equal({
          'pact:matcher:type': 'integer',
          'pact:generator:type': 'RandomInt',
          value: 101,
        });
      });
    });
  });

  describe('#decimal', () => {
    it('returns a JSON representation of an decimal matcher', () => {
      const result = MatchersV3.decimal(100.3);
      expect(result).to.deep.equal({
        'pact:matcher:type': 'decimal',
        value: 100.3,
      });
    });

    describe('when the example is zero', () => {
      it('returns a JSON representation of an integer matcher', () => {
        const result = MatchersV3.decimal(0.0);
        expect(result).to.deep.equal({
          'pact:matcher:type': 'decimal',
          value: 0.0,
        });
      });
    });

    describe('when no example is given', () => {
      it('also includes a random decimal generator', () => {
        const result = MatchersV3.decimal();
        expect(result).to.deep.equal({
          'pact:matcher:type': 'decimal',
          'pact:generator:type': 'RandomDecimal',
          value: 12.34,
        });
      });
    });
  });

  describe('#number', () => {
    it('returns a JSON representation of an number matcher', () => {
      const result = MatchersV3.number(100.3);
      expect(result).to.deep.equal({
        'pact:matcher:type': 'number',
        value: 100.3,
      });
    });

    describe('when no example is given', () => {
      it('also includes a random integer generator', () => {
        const result = MatchersV3.number();
        expect(result).to.deep.equal({
          'pact:matcher:type': 'number',
          'pact:generator:type': 'RandomInt',
          value: 1234,
        });
      });
    });
  });

  describe('#boolean', () => {
    it('returns a JSON representation of a like matcher', () => {
      const result = MatchersV3.boolean(true);
      expect(result).to.deep.equal({
        'pact:matcher:type': 'type',
        value: true,
      });
    });
  });

  describe('#string', () => {
    it('returns a JSON representation of a like matcher', () => {
      const result = MatchersV3.string('true');
      expect(result).to.deep.equal({
        'pact:matcher:type': 'type',
        value: 'true',
      });
    });
  });

  describe('#regex', () => {
    it('returns a JSON representation of a regex matcher', () => {
      const result = MatchersV3.regex('\\d+', '1234');
      expect(result).to.deep.equal({
        'pact:matcher:type': 'regex',
        regex: '\\d+',
        value: '1234',
      });
    });

    describe('when given a regular expression', () => {
      it('returns a JSON representation of a regex matcher', () => {
        const result = MatchersV3.regex(/\d+/, '1234');
        expect(result).to.deep.equal({
          'pact:matcher:type': 'regex',
          regex: '\\d+',
          value: '1234',
        });
      });
    });
  });

  describe('#equal', () => {
    it('returns a JSON representation of an equality matcher', () => {
      const result = MatchersV3.equal('true');
      expect(result).to.deep.equal({
        'pact:matcher:type': 'equality',
        value: 'true',
      });
    });
  });

  describe('#datetime', () => {
    describe('when an example is given', () => {
      it('returns a JSON representation of a datetime matcher', () => {
        const result = MatchersV3.datetime(
          "yyyy-MM-dd'T'HH:mm:ss.SSSX",
          '2016-02-11T09:46:56.023Z'
        );
        expect(result).to.deep.equal({
          'pact:matcher:type': 'timestamp',
          format: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
          value: '2016-02-11T09:46:56.023Z',
        });
      });
    });
  });

  describe('#time', () => {
    it('returns a JSON representation of a time matcher', () => {
      const result = MatchersV3.time('HH:mm:ss', '09:46:56');
      expect(result).to.deep.equal({
        'pact:generator:type': 'Time',
        'pact:matcher:type': 'time',
        format: 'HH:mm:ss',
        value: '09:46:56',
      });
    });
  });

  describe('#date', () => {
    it('returns a JSON representation of a date matcher', () => {
      const result = MatchersV3.date('yyyy-MM-dd', '2016-02-11');
      expect(result).to.deep.equal({
        'pact:generator:type': 'Date',
        'pact:matcher:type': 'date',
        format: 'yyyy-MM-dd',
        value: '2016-02-11',
      });
    });
  });

  describe('#includes', () => {
    it('returns a JSON representation of an include matcher', () => {
      const result = MatchersV3.includes('true');
      expect(result).to.deep.equal({
        'pact:matcher:type': 'include',
        value: 'true',
      });
    });
  });

  describe('#nullValue', () => {
    it('returns a JSON representation of an null matcher', () => {
      const result = MatchersV3.nullValue();
      expect(result).to.deep.equal({
        'pact:matcher:type': 'null',
      });
    });
  });

  describe('#url', () => {
    it('returns a JSON representation of a regex matcher for the URL', () => {
      const result = MatchersV3.url2('http://localhost:8080', [
        'users',
        '1234',
        'posts',
        'latest',
      ]);
      expect(result).to.deep.equal({
        'pact:matcher:type': 'regex',
        regex: '.*(\\/users\\/1234\\/posts\\/latest)$',
        value: 'http://localhost:8080/users/1234/posts/latest',
      });
    });

    describe('when provided with a regex matcher', () => {
      it('returns a JSON representation of a regex matcher for the URL', () => {
        const result = MatchersV3.url2('http://localhost:8080', [
          'users',
          MatchersV3.regex('\\d+', '1234'),
          'posts',
          'latest',
        ]);
        expect(result).to.deep.equal({
          'pact:matcher:type': 'regex',
          regex: '.*(\\/users\\/\\d+\\/posts\\/latest)$',
          value: 'http://localhost:8080/users/1234/posts/latest',
        });
      });
    });

    describe('when provided with a regular expression', () => {
      it('returns a JSON representation of a regex matcher for the URL', () => {
        const result = MatchersV3.url2('http://localhost:8080', [
          'users',
          /\d+/,
          'posts',
          'latest',
        ]);
        expect(result).to.deep.contain({
          'pact:matcher:type': 'regex',
          regex: '.*(\\/users\\/\\d+\\/posts\\/latest)$',
        });
        expect(result.value).to.match(/\/users\/\d+\/posts\/latest$/);
      });
    });

    describe('when no base URL is provided', () => {
      it('returns regex matcher and a MockServerURL generator', () => {
        const result = MatchersV3.url([
          'users',
          MatchersV3.regex('\\d+', '1234'),
          'posts',
          'latest',
        ]);
        expect(result).to.deep.equal({
          'pact:matcher:type': 'regex',
          'pact:generator:type': 'MockServerURL',
          regex: '.*(\\/users\\/\\d+\\/posts\\/latest)$',
          value: 'http://localhost:8080/users/1234/posts/latest',
          example: 'http://localhost:8080/users/1234/posts/latest',
        });
      });
    });
  });

  describe('#uuid', () => {
    it('returns a JSON representation of an regex matcher for UUIDs', () => {
      const result = MatchersV3.uuid('ba4bd1bc-5556-11eb-9286-d71bc5b507be');
      expect(result).to.deep.equal({
        'pact:matcher:type': 'regex',
        regex: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        value: 'ba4bd1bc-5556-11eb-9286-d71bc5b507be',
      });
    });

    it('throws an exception if the example value does not match the UUID regex', () => {
      expect(() => MatchersV3.uuid('not a uuid')).to.throw();
      expect(() => MatchersV3.uuid('ba4bd1bc-5556-11eb-9286')).to.throw();
      expect(() =>
        MatchersV3.uuid('ba4bd1bc-5556-11eb-9286-d71bc5b507be-1234')
      ).to.throw();
    });

    it('if no example is provided, it sets up a generator', () => {
      const result = MatchersV3.uuid();
      expect(result).to.deep.equal({
        'pact:matcher:type': 'regex',
        'pact:generator:type': 'Uuid',
        regex: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        value: 'e2490de5-5bd3-43d5-b7c4-526e33f71304',
      });
    });
  });

  describe('#reify', () => {
    describe('when given an object with no matchers', () => {
      const object = {
        some: 'data',
        more: 'strings',
        an: ['array'],
        someObject: {
          withData: true,
          withNumber: 1,
        },
      };

      it('returns just that object', () => {
        expect(MatchersV3.reify(object)).to.deep.equal(object);
      });
    });

    describe('when given an object with null values', () => {
      const object = {
        some: 'data',
        more: null,
        an: [null],
        someObject: {
          withData: true,
          withNumber: 1,
          andNull: null,
        },
      };

      it('returns just that object', () => {
        expect(MatchersV3.reify(object)).to.deep.equal(object);
      });
    });

    describe('when given an object with some matchers', () => {
      const someMatchers = {
        some: MatchersV3.like('data'),
        more: 'strings',
        an: ['array'],
        another: MatchersV3.eachLike('this'),
        someObject: {
          withData: MatchersV3.like(true),
          withTerm: MatchersV3.regex('this|that', 'this'),
          withNumber: 1,
          withAnotherNumber: MatchersV3.like(2),
        },
      };

      const expected = {
        some: 'data',
        more: 'strings',
        an: ['array'],
        another: ['this'],
        someObject: {
          withData: true,
          withTerm: 'this',
          withNumber: 1,
          withAnotherNumber: 2,
        },
      };

      it('returns without matching guff', () => {
        expect(MatchersV3.reify(someMatchers)).to.deep.equal(expected);
      });
    });

    describe('when given a simple matcher', () => {
      it('removes all matching guff', () => {
        const expected = 'myawesomeword';

        const matcher = MatchersV3.regex('\\w+', 'myawesomeword');

        expect(MatchersV3.isMatcher(matcher)).to.eq(true);
        expect(MatchersV3.reify(matcher)).to.eql(expected);
      });
    });
    describe('when given a complex nested object with matchers', () => {
      it('removes all matching guff', () => {
        const o = MatchersV3.like({
          stringMatcher: {
            awesomeSetting: MatchersV3.like('a string'),
          },
          anotherStringMatcher: {
            nestedSetting: {
              anotherStringMatcherSubSetting: MatchersV3.like(true),
            },
            anotherSetting: MatchersV3.regex('this|that', 'this'),
          },
          arrayMatcher: {
            lotsOfValueregex: MatchersV3.atLeastOneLike('useful', 3),
          },
          arrayOfMatcherregex: {
            lotsOfValueregex: MatchersV3.atLeastOneLike(
              {
                foo: 'bar',
                baz: MatchersV3.like('bat'),
              },
              3
            ),
          },
        });

        const expected = {
          stringMatcher: {
            awesomeSetting: 'a string',
          },
          anotherStringMatcher: {
            nestedSetting: {
              anotherStringMatcherSubSetting: true,
            },
            anotherSetting: 'this',
          },
          arrayMatcher: {
            lotsOfValueregex: ['useful', 'useful', 'useful'],
          },
          arrayOfMatcherregex: {
            lotsOfValueregex: [
              {
                baz: 'bat',
                foo: 'bar',
              },
              {
                baz: 'bat',
                foo: 'bar',
              },
              {
                baz: 'bat',
                foo: 'bar',
              },
            ],
          },
        };

        expect(MatchersV3.reify(o)).to.deep.equal(expected);
      });
    });
  });
});
