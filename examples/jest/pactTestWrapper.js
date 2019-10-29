jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

beforeAll(done => {
  provider.setup().then(() => done())
})

afterAll(done => {
  provider.finalize().then(() => done())
})
