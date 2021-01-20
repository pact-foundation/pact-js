import axios, { AxiosPromise } from "axios"

export class DogService {
  constructor(private url: string) {}

  public getMeDogs = (from: string): AxiosPromise => {
    return axios.request({
      baseURL: this.url,
      params: { from: from },
      headers: { Accept: "application/json" },
      method: "GET",
      url: "/dogs",
    })
  }
}
