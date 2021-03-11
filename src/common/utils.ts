import q from "q"

// Convert a q promise to regular Promise
export function qToPromise<T>(promise: q.Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    promise.then(
      (value: T) => resolve(value),
      (error: Error) => reject(error)
    )
  })
}
