const express = require('express');
const request = require('superagent');
const server = express();

const getApiEndpoint = () => process.env.API_HOST || 'http://localhost:8081';
const authHeader = {
  Authorization: 'Bearer token',
};

// Fetch animals who are currently 'available' from the
// Animal Service
const availableAnimals = (api = getApiEndpoint, filter = {}) =>
  request
    .get(`${api()}/animals/available`)
    .query({ ...filter })
    .set(authHeader)
    .then((res) => res.body);

// Find animals by their ID from the Animal Service
const getAnimalById = (
  id,
  api = getApiEndpoint,
  format = 'application/json'
) => {
  const r = request
    .get(`${api()}/animals/${id}`)
    .set(authHeader)
    .set({ Accept: format });

  if (format === 'text/plain') {
    return r.then((res) => res.text);
  }

  return r.then(
    (res) => res.body,
    () => null
  );
};

// Suggestions function:
// Given availability and sex etc. find available suitors,
// and give them a 'score'
const suggestion = (mate, api, filter = {}) => {
  const predicates = [
    (candidate, animal) => candidate.id !== animal.id,
    (candidate, animal) => candidate.gender !== animal.gender,
    (candidate, animal) => candidate.animal === animal.animal,
  ];

  const weights = [(candidate, animal) => Math.abs(candidate.age - animal.age)];

  return availableAnimals(api, filter).then((available) => {
    const eligible = available.filter(
      (a) => !predicates.map((p) => p(a, mate)).includes(false)
    );

    return {
      suggestions: eligible.map((candidate) => {
        const score = weights.reduce((acc, weight) => {
          return acc - weight(candidate, mate);
        }, 100);

        return {
          score,
          animal: candidate,
        };
      }),
    };
  });
};

// Creates a mate for suggestions
const createMateForDates = (
  mate,
  api = getApiEndpoint,
  contentType = 'application/json'
) => {
  return request
    .post(`${api()}/animals`)
    .set(authHeader)
    .send(mate)
    .set('Content-Type', contentType + '; charset=utf-8');
};

// Suggestions API
server.get('/suggestions/:animalId', (req, res) => {
  if (!req.params.animalId) {
    res.writeHead(400);
    res.end();
  }
  request
    .get(`${getApiEndpoint()}/animals/${req.params.animalId}`)
    .set(authHeader)
    .then((r) => {
      if (r.statusCode === 200) {
        suggestion(r.body).then((suggestions) => {
          res.json(suggestions);
        });
      } else if (r && r.statusCode === 404) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(500);
        res.end();
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.writeHead(500);
      res.end();
    });
});

const getAnimalsAsXML = (api = getApiEndpoint) => {
  return request
    .get(`${api()}/animals/available/xml`)
    .set(authHeader)
    .then(
      (res) => res.body,
      () => null
    );
};

module.exports = {
  server,
  availableAnimals,
  createMateForDates,
  suggestion,
  getAnimalById,
  getAnimalsAsXML,
};
