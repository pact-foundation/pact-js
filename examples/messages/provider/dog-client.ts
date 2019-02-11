// API integration client
export function createDog(id: number): any {
  return new Promise((resolve, reject) => {
    resolve({
      id,
      name: "fido",
      type: "bulldog",
    })
  })
}
