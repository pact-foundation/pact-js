import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60000,
    pool: 'forks',
    sequence: { concurrent: false },
    include: ['src/**/*.spec.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: {
        lines: 50,
        statements: 50,
      },
    },
  },
});
