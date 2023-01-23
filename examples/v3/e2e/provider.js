const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Repository = require('./repository');
const xml = require('xml');

const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
server.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

server.use((req, res, next) => {
  const token = req.headers['authorization'] || '';

  if (token !== 'Bearer token') {
    res.sendStatus(401).send();
  } else {
    next();
  }
});

const animalRepository = new Repository();

// Load default data into a repository
const importData = () => {
  const data = require('./data/animalData.json');
  data.reduce((a, v) => {
    v.id = a + 1;
    animalRepository.insert(v);
    return a + 1;
  }, 0);
};

// List all animals with 'available' eligibility
const availableAnimals = () => {
  return animalRepository.fetchAll().filter((a) => {
    return a.eligibility.available;
  });
};

// Get all animals
server.get('/animals', (req, res) => {
  res.json(animalRepository.fetchAll());
});

// Get all available animals
server.get('/animals/available', (req, res) => {
  res.json(availableAnimals());
});

// Get all available animals as XML
server.get('/animals/available/xml', (req, res) => {
  res.header('Content-Type', 'application/xml; charset=utf-8');
  let xml_body = xml({
    animals: animalRepository.fetchAll().map((animal) => {
      let result = {};
      result[animal.animal] = { _attr: animal };
      return result;
    }),
  });
  res.end(xml_body);
});

// Find an animal by ID
server.get('/animals/:id', (req, res) => {
  const response = animalRepository.getById(req.params.id);
  if (response) {
    if (req.header('accept') === 'text/plain') {
      res.contentType('text/plain; charset=utf-8');
      res.end(
        `id=${response.id};first_name=${response.first_name};last_name=${response.last_name};animal=${response.animal}`
      );
    } else {
      res.end(JSON.stringify(response));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Register a new Animal for the service
server.post('/animals', (req, res) => {
  let animal = req.body;
  console.log(req.body);
  console.log(req.body.first_name);
  console.log(req.headers);

  // Really basic validation
  if (!animal || !animal.first_name) {
    try {
      // Workaround/Recreation for https://github.com/pact-foundation/pact-js/issues/884
      // Issue with x-www-form-urlencoded data
      //
      // This code block is only entered during the Pact test, with a request made
      // from the following withRequest
      //
      //
      // .withRequest({
      //   method: 'POST',
      //   path: '/animals',
      //   body: 'first_name=Nanny&last_name=Doe',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   contentType: 'application/x-www-form-urlencoded',
      // })
      //
      // You can make the following request to confirm when running the api with npm run api
      // curl -X POST http://localhost:8081/animals -H "Authorization: Bearer 1234" -d "first_name=foo"
      //
      // Pact Verifier is sending the following data.
      //
      // { '{"first_name":"Nanny","last_name":"Doe"}': '' }
      animal = JSON.parse(Object.keys(req.body)[0]);
      console.log('entered during Pact verification only');

      animal.id = animalRepository.fetchAll().length;
      animalRepository.insert(animal);
      return res.json(animal);
    } catch (e) {
      //
    }
    res.writeHead(400);
    res.end();

    return;
  }

  animal.id = animalRepository.fetchAll().length;
  animalRepository.insert(animal);

  res.json(animal);
});

module.exports = {
  server,
  importData,
  animalRepository,
};
