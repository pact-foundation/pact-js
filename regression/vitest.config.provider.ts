import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@pact-foundation/pact': path.resolve(__dirname, '../src/index.ts'),
      'aws-sdk': path.resolve(__dirname, '__mocks__/aws-sdk.ts'),
    },
  },
  test: {
    globals: false,
    testTimeout: 120000,
    pool: 'forks',
    sequence: { concurrent: false },
    deps: {
      // graphql-http's ESM build imports graphql natively (Node.js CJS path),
      // while provider.ts uses graphql via Vite (ESM path), causing a cross-realm
      // GraphQLSchema error. Inlining graphql-http forces it through Vite so both
      // resolve to the same graphql/index.mjs instance.
      inline: ['graphql-http'],
    },
    include: [
      'v2/e2e/test/provider.spec.ts',
      'v2/graphql/src/provider.spec.ts',
      'v2/messages/provider/message-provider.spec.ts',
      'v2/serverless/provider/message-provider.spec.ts',
      'v3/e2e/test/provider.spec.ts',
      'v3/graphql/src/provider.spec.ts',
      'v3/provider-state-injected/provider/account-service.spec.ts',
      'v3/run-specific-verifications/test/provider.spec.ts',
      'v3/todo-consumer/test/provider.spec.ts',
    ],
  },
});
