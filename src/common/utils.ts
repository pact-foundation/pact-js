import * as q from "q";
import { Promise } from "es6-promise";

// Convert a q promise to regular Promise
export function qToPromise<T>(promise: q.Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    promise
      .then((value: T) => resolve(value), (error: any) => reject(error));
  });
}
