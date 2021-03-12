import axios, { AxiosPromise } from "axios"

export class DogService {
  private url: string
  private port: number

  constructor(endpoint: any) {
    this.url = endpoint.url
    this.port = endpoint.port
  }

  public getMeDogs = (): AxiosPromise => {
    return axios.request({
      baseURL: `${this.url}:${this.port}`,
      headers: { Accept: "application/json" },
      method: "GET",
      url: "/dogs",
    })
  }
}
