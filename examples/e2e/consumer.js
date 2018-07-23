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

// Creates a mate for suggestions
const createMateForDates = (mate) => {
  return request
    .post(`${API_HOST}/animals`)
    .send(mate)
    .set('Content-Type', 'application/json; charset=utf-8')
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

module.exports = {
  server,
  availableAnimals,
  createMateForDates,
  suggestion,
  getAnimalById
}
