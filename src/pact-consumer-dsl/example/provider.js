import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'

const server = express()

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/projects', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Project 1',
      due: '2016-02-11T09:46:56.023Z',
      tasks: [
        {id: 1, name: 'Do the laundry', 'done': true},
        {id: 2, name: 'Do the dishes', 'done': false},
        {id: 3, name: 'Do the backyard', 'done': false},
        {id: 4, name: 'Do nothing', 'done': false}
      ]
    }
  ])
})

export default server
