import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@pact-foundation/pact': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  test: {
    globals: false,
    testTimeout: 60000,
    pool: 'forks',
    sequence: { concurrent: false },
    deps: {},
    include: [
      'v2/e2e/test/consumer.spec.ts',
      'v2/graphql/src/consumer.spec.ts',
      'v2/messages/consumer/message-consumer.spec.ts',
      'v2/serverless/consumer/consumer.spec.ts',
      'v2/typescript/test/get-dog.spec.ts',
      'v3/e2e/test/consumer.spec.ts',
      'v3/graphql/src/consumer.spec.ts',
      'v3/multipart/consumer-matching-rules.spec.ts',
      'v3/multipart/consumer.spec.ts',
      'v3/provider-state-injected/consumer/transaction-service.spec.ts',
      'v3/todo-consumer/test/consumer.spec.ts',
      'v3/typescript/test/multi-interactions.user.spec.ts',
      'v3/typescript/test/user.spec.ts',
      'v3/with-matching-rules/consumer.spec.ts',
    ],
  },
});
