import axios, { AxiosPromise } from 'axios';

export class UserService {
  constructor(private url: string) {}

  public getUser = (id: number): AxiosPromise => {
    return axios.request({
      baseURL: this.url,
      headers: { Accept: 'application/json' },
      method: 'GET',
      url: `/users/${id}`,
    });
  };
}
