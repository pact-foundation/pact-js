import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import xml from 'xml';
import Repository from './repository';

export const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
server.use((_req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

server.use((req, res, next) => {
  const token = req.headers.authorization || '';

  if (token !== 'Bearer token') {
    res.sendStatus(401);
  } else {
    next();
  }
});

export const animalRepository = new Repository();

// Load default data into a repository
export const importData = () => {
  const data = require('./data/animalData.json');
  data.reduce((a, v) => {
    v.id = a + 1;
    animalRepository.insert(v);
    return a + 1;
  }, 0);
};

interface Animal {
  id?: number;
  first_name?: string;
  last_name?: string;
  animal?: string;
  eligibility: { available: boolean };
}

// List all animals with 'available' eligibility
const availableAnimals = () => {
  return animalRepository.fetchAll().filter((a) => {
    return (a as Animal).eligibility.available;
  });
};

// Get all animals
server.get('/animals', (_req, res) => {
  res.json(animalRepository.fetchAll());
});

// Get all available animals
server.get('/animals/available', (_req, res) => {
  res.json(availableAnimals());
});

// Get all available animals as XML
server.get('/animals/available/xml', (_req, res) => {
  res.header('Content-Type', 'application/xml; charset=utf-8');
  const xml_body = xml({
    animals: animalRepository
      .fetchAll()
      .filter((a): a is Animal => typeof (a as Animal).animal === 'string')
      .map((animal) => {
        const result: Record<string, unknown> = {};
        result[animal.animal] = { _attr: animal };
        return result;
      }),
  });
  res.end(xml_body);
});

// Find an animal by ID
server.get('/animals/:id', (req, res) => {
  const response = animalRepository.getById(req.params.id) as
    | Animal
    | undefined;
  if (response) {
    if (req.header('accept') === 'text/plain') {
      res.contentType('text/plain; charset=utf-8');
      res.end(
        `id=${response.id};first_name=${response.first_name};last_name=${response.last_name};animal=${response.animal}`,
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
  const animal = req.body;

  // Really basic validation
  if (!animal?.first_name) {
    res.writeHead(400);
    res.end();
    return;
  }

  animal.id = animalRepository.fetchAll().length;
  animalRepository.insert(animal);

  res.json(animal);
});
