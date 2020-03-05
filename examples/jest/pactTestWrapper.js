jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

beforeAll(() => provider.setup())

afterAll(() => provider.finalize())
