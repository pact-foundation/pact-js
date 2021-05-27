const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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

server.get('/pass', (req, res) => {
  res.json({ result: 'OK' });
  res.end();
});
server.get('/fail', (req, res) => {
  res.json({ result: 'FAIL' });
  res.end();
});

module.exports = {
  server,
};
