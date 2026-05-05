import axios from 'axios';

export const getMeDogs = (endpoint: { url: string; port: number }) => {
  const { url, port } = endpoint;

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/dogs',
    headers: {
      Accept: [
        'application/problem+json',
        'application/json',
        'text/plain',
        '*/*',
      ],
    },
  });
};

export const getMeDog = (endpoint: { url: string; port: number }) => {
  const { url, port } = endpoint;

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/dogs/1',
    headers: { Accept: 'application/json' },
  });
};
