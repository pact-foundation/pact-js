'use strict'

import Promise from 'bluebird'
import request from 'superagent-bluebird-promise'

import Pact from '../pact'
import server from './provider'

function requestProjects () {
  return Promise.all([
    request.get('http://localhost:9980/projects').set({ 'Accept': 'application/json' }),
    request.get('http://localhost:9980/projects/2').set({ 'Accept': 'application/json' })
  ])
}

server.listen(9980, () => {
  const pact = Pact({
    consumer: 'Test DSL',
    provider: 'Projects'
  })

  const body = [{
    id: 1,
    name: 'Project 1',
    due: '2016-02-11T09:46:56.023Z',
    tasks: [
      {id: 1, name: 'Do the laundry', 'done': true},
      {id: 2, name: 'Do the dishes', 'done': false},
      {id: 3, name: 'Do the backyard', 'done': false},
      {id: 4, name: 'Do nothing', 'done': false}
    ]
  }]

  pact.intercept('http://localhost:9980')

  pact.interaction()
    .given('i have a list of projects')
    .uponReceiving('a request for projects')
    .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
    .willRespondWith(200, { 'Content-Type': 'application/json' }, body)

  pact.interaction()
    .given('i have a list of projects')
    .uponReceiving('a request for a project that does not exist')
    .withRequest('get', '/projects/2', null, { 'Accept': 'application/json' })
    .willRespondWith(404, { 'Content-Type': 'application/json' })

  pact.verify(() => requestProjects(), (err, data) => {
    if (err) {
      console.log('Pact verification failed.')
      console.log(err)
      process.exit(1)
    }
    console.log('Pact verification completed. Make sure to do your own assertions.')
    process.exit(0)
  })
})
