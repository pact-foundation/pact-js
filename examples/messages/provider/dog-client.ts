// API integration client
export function createDog(id: number): any {
  return new Promise((resolve, reject) => {
    resolve({
      identifier: {},
      body: {
        projectId: 1,
        projectPath: "path",
        movPath: "path",
        mp4Path: "path",
      },
    })
  })
}
