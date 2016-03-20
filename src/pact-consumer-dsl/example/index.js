'use strict'

import request from 'superagent-bluebird-promise'

import server from './provider'
import Pact from '../src/pact-consumer-dsl/pact'
import Interaction from '../src/pact-consumer-dsl/interaction'

server.listen(9980, () => {
  const pact = Pact({
    consumer: 'Test DSL',
    provider: 'Projects',
    targetHost: 'localhost',
    targetPort: 9980
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

  pact.addInteraction(
    new Interaction()
      .uponReceiving('a request for projects')
      .withRequest('get', '/projects')
      .willRespondWith(200, { 'Content-Type': 'application/json' }, body)
  )

  request
    .get('http://localhost:9980/projects')
    .then((res) => {
      pact.verify(() => { console.log('Pact written.') })
    })
    .catch((err) => { console.error(err) })
})
