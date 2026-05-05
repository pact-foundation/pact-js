import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import eyes from 'eyes';
import * as R from 'ramda';
import fs from 'node:fs';

const parser = new XMLParser({
  ignoreAttributes: false,
});
let serverUrl = 'http://127.0.0.1:2203';

export default {
  getProjects: async (format = 'json') => {
    return axios
      .get(`${serverUrl}/projects?from=today`, {
        headers: {
          Accept: `application/${format}`,
        },
      })
      .then((response) => {
        console.log('todo response:');
        eyes.inspect(response.data);
        if (format.endsWith('xml')) {
          const result = parser.parse(response.data);
          console.dir(result, { depth: 10 });
          console.log(R.path(['ns1:projects'], result));
          return R.path(['ns1:projects'], result);
        }
        return response.data;
      })
      .catch((error) => {
        console.log('todo error', error.message);
        return Promise.reject(error);
      });
  },
  setUrl: function (url: string) {
    serverUrl = url;
    return this;
  },
  postImage: (id, image: string) => {
    const data = fs.readFileSync(image);
    return axios.post(`${serverUrl}/projects/${id}/images`, data, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  },
};
