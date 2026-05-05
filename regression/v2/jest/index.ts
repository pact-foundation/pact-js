import axios from 'axios';

export const getMeDogs = (endpoint: { url: string }) => {
  const { url } = endpoint;

  return axios
    .request({
      method: 'GET',
      baseURL: url,
      url: '/dogs',
      headers: { Accept: 'application/json' },
    })
    .then((response) => response.data);
};

export const getMeCats = (endpoint: { url: string }) => {
  const { url } = endpoint;

  return axios
    .request({
      method: 'GET',
      baseURL: url,
      url: '/cats?catId[]=2&catId[]=3',
      headers: { Accept: 'application/json' },
    })
    .then((response) => response.data);
};
