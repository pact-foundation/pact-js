const express = require('express')
const request = require('superagent')
const server = express()
const API_HOST = process.env.API_HOST || 'http://localhost:8081'

// Fetch animals who are currently 'available' from the
// Animal Service
const availableAnimals = () => {
  return request
    .get(`${API_HOST}/animals/available`)
    .then(res => res.body,
      () => [])
}

// Find animals by their ID from the Animal Service
const getAnimalById = (id) => {
  return request
    .get(`${API_HOST}/animals/${id}`)
    .then(res => res.body,
      () => null)
}

const addAnimal = (animal) => {
  return request
    .post(`${API_HOST}/animals`)
    .set('Content-Type', 'application/json; charset=utf-8')
    .send(animal)
    .then(res => res.body,
      () => [])
}

// Suggestions function:
// Given availability and sex etc. find available suitors,
// and give them a 'score'
const suggestion = mate => {
  const predicates = [
    ((candidate, animal) => candidate.id !== animal.id),
    ((candidate, animal) => candidate.gender !== animal.gender),
    ((candidate, animal) => candidate.animal === animal.animal)
  ]

  const weights = [
    ((candidate, animal) => Math.abs(candidate.age - animal.age))
  ]

  return availableAnimals().then(available => {
    const eligible = available.filter(a => !predicates.map(p => p(a, mate)).includes(false))

    return {
      suggestions: eligible.map(candidate => {
        const score = weights.reduce((acc, weight) => {
          return acc - weight(candidate, mate)
        }, 100)

        return {
          score,
          'animal': candidate
        }
      })
    }
  })
}

// Suggestions API
server.get('/suggestions/:animalId', (req, res) => {
  if (!req.params.animalId) {
    res.writeHead(400)
    res.end()
  }

  request(`${API_HOST}/animals/${req.params.animalId}`, (err, r) => {
    if (!err && r.statusCode === 200) {
      suggestion(r.body).then(suggestions => {
        res.json(suggestions)
      })
    } else if (r && r.statusCode === 404) {
      res.writeHead(404)
      res.end()
    } else {
      res.writeHead(500)
      res.end()
    }
  })
})

const animal = {
  first_name: 'Elephant',
  last_name: 'Cantwaittobeking',
  animal: 'lion',
  age: 4,
  available_from: '2017-12-04T14:47:18.582Z',
  gender: 'M',
  location: {
    description: 'Werribee Zoo',
    country: 'Australia',
    post_code: 3000
  },
  eligibility: {
    available: true,
    previously_married: true
  },
  interests: [
    'parkour'
  ]
}

server.post('/suggestions', (req, res) => {
  if (!req.body) {
    res.writeHead(400)
    res.end()
  }
  request.post(`${API_HOST}/animals`).set('Content-Type', 'application/json; charset=utf-8').send(animal).end((res) => {
    if (res.status === 200) {
      res.json(animal)
    } else {
      res.writeHead(400)
      res.end()
    }
  })
})

module.exports = {
  server,
  availableAnimals,
  suggestion,
  getAnimalById,
  addAnimal
}
