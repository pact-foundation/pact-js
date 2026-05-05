// Stub for aws-sdk: the regression tests only exercise createEvent(),
// which has no AWS dependency. SNS.publish is never called in tests.
export class SNS {
  publish(_params: unknown, cb: (err: null, data: unknown) => void) {
    cb(null, {});
  }
}

export default { SNS };
