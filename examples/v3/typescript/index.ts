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

  public getUserProfile = (id: number): AxiosPromise => {
    // check user exists first via getUser and then return profile
    return this.getUser(id).then(() =>
      axios.request({
        baseURL: this.url,
        headers: { Accept: 'application/json' },
        method: 'GET',
        url: `/users/${id}/profile`,
      })
    );
  };
}
