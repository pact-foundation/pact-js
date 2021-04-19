const express = require('express');
const server = express();

server.get('/projects', (req, res) => {
  if (req.headers.accept.endsWith('xml')) {
    res.header('Content-Type', 'application/todo+xml');
    res.send(
      "<?xml version='1.0'?><ns1:projects id='1234' xmlns:ns1='http://some.namespace/and/more/stuff'><ns1:project id='1' name='Project 1' type='activity'><ns1:tasks><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/></ns1:tasks></ns1:project><ns1:project id='1' name='Project 1' type='activity'><ns1:tasks><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/></ns1:tasks></ns1:project></ns1:projects>"
    );
  } else {
    res.header('Content-Type', 'application/json');
    res.send([
      {
        id: 1,
        name: 'Project 1',
        type: 'activity',
        due: '2016-02-11T09:46:56.023Z',
        tasks: [
          {
            done: true,
            id: 1,
            name: 'Task 1',
          },
          {
            done: true,
            id: 2,
            name: 'Task 2',
          },
          {
            done: true,
            id: 3,
            name: 'Task 3',
          },
          {
            done: true,
            id: 4,
            name: 'Task 4',
          },
        ],
      },
    ]);
  }
});

server.post('/projects/:id/images', (req, res) => {
  res.status(201).end();
});

module.exports = {
  server,
};
