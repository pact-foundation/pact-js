import axios, { AxiosPromise } from 'axios';
export class DogService {
  private url: string;

  constructor(endpoint: any) {
    this.url = endpoint.url;
  }

  // API Client that will fetch dogs from the Dog API
  // This is the target of our Pact test
  public getMeDogs = (from: string): AxiosPromise => {
    return axios.request({
      baseURL: this.url,
      params: { from },
      headers: { Accept: 'application/json' },
      method: 'GET',
      url: '/dogs',
    });
  };

  // get dog profile, check dog exists first via getMeDogs and then return profile
  public getDogProfile = (id: number, from: string): AxiosPromise => {
    return this.getMeDogs(from).then(() =>
      axios.request({
        baseURL: this.url,
        headers: { Accept: 'application/json' },
        method: 'GET',
        url: `/dogs/${id}/profile`,
      })
    );
  };
}
