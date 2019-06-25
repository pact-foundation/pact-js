export const getMsg = () => {
  return new Promise(resolve =>
    resolve({
      body: {
        movPath: "C:/xampp/htdocs/render-service/538481.mov",
        mp4Path: "C:/xampp/htdocs/render-service/538481.mp4",
        projectId: 538481,
        projectPath: "C:/xampp/htdocs/render-service/538481.aep",
      },
      identifier: {},
    })
  )
}
