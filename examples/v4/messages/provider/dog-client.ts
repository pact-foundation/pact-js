// API integration client
interface Dog {
  id: number;
  name: string;
  type: string;
}

export function createDog(id: number): Promise<Dog> {
  return new Promise((resolve, _reject) => {
    resolve({
      id,
      name: 'fido',
      type: 'bulldog',
    });
  });
}
