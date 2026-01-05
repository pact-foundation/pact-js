// API integration client
export function createDog(id: number): any {
  return new Promise((resolve, reject) => {
    resolve({
      id,
      classification: 'ThisFixedValue',
      fooVersion: 1,
      fooIdentifier: "bar"
    });
  });
}
