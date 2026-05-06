import {
  MessageConsumerPact,
  synchronousBodyHandler,
  asynchronousBodyHandler,
} from './messageConsumerPact';
import type { ConcreteMessage } from './dsl/message';

describe('MessageConsumer', () => {
  let consumer: MessageConsumerPact;

  beforeEach(() => {
    consumer = new MessageConsumerPact({
      consumer: 'myconsumer',
      provider: 'myprovider',
    });
  });

  const testMessage: ConcreteMessage = {
    contents: {
      foo: 'bar',
    },
  };

  describe('#constructor', () => {
    it('creates a Consumer when all mandatory parameters are provided', () => {
      expect(consumer).toBeTypeOf('object');
      expect(typeof consumer.verify).toBe('function');
    });
  });

  describe('#dsl', () => {
    describe('when an empty description has been given', () => {
      it('it should throw an error', () => {
        expect(() => {
          consumer.expectsToReceive('');
        }).toThrow(Error);
      });
    });

    describe('when an empty content object has been given', () => {
      it('it should throw an error', () => {
        expect(() => {
          consumer.withContent({});
        }).toThrow(Error);
      });
    });

    describe('when an empty metadata object has been given', () => {
      it('it should throw an error', () => {
        expect(() => {
          consumer.withMetadata({});
        }).toThrow(Error);
      });
    });
  });

  describe('#verify', () => {
    describe('when given a valid handler and message', () => {
      it('verifies the consumer message', async () => {
        const stubbedConsumer = new MessageConsumerPact({
          consumer: 'myconsumer',
          provider: 'myprovider',
        });
        // biome-ignore lint/suspicious/noExplicitAny: accessing private getServiceFactory method for test stubbing
        const stub = stubbedConsumer as any;

        // Stub out service factory
        stub.getServiceFactory = () => ({
          createMessage: () => Promise.resolve('message created'),
        });

        stubbedConsumer
          .given('some state')
          .expectsToReceive('A message about something')
          .withContent({ foo: 'bar' })
          .withMetadata({ baz: 'bat' });

        await stubbedConsumer.verify(() => Promise.resolve('yay!'));
      });
    });
  });

  describe('handler transformers', () => {
    describe('#asynchronousbodyHandler', () => {
      describe('when given a function that succeeds', () => {
        it('returns a Handler object that returns a completed promise', async () => {
          const failFn = () => Promise.resolve('yay!');
          const hFn = asynchronousBodyHandler(failFn);

          await hFn(testMessage);
        });
      });

      describe('when given a function that throws an Exception', () => {
        it('returns a Handler object that returns a rejected promise', async () => {
          const failFn = () => Promise.reject(new Error('fail'));
          const hFn = asynchronousBodyHandler(failFn);

          await expect(hFn(testMessage)).rejects.toThrow();
        });
      });
    });

    describe('#synchronousbodyHandler', () => {
      describe('when given a function that succeeds', () => {
        it('returns a Handler object that returns a completed promise', async () => {
          const failFn = () => {
            /* do nothing! */
          };
          const hFn = synchronousBodyHandler(failFn);

          await hFn(testMessage);
        });
      });

      describe('when given a function that throws an Exception', () => {
        it('returns a Handler object that returns a rejected promise', async () => {
          const failFn = () => {
            throw new Error('fail');
          };
          const hFn = synchronousBodyHandler(failFn);

          await expect(hFn(testMessage)).rejects.toThrow();
        });
      });
    });
  });
});
