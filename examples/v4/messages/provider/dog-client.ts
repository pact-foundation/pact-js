// API integration client
export function createDog(id: number): any {
  return new Promise((resolve, _reject) => {
    resolve({
      id,
      name: 'fido',
      type: 'bulldog',
    });
  });
}
