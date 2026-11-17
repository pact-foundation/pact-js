import cors from 'cors';
import express from 'express';

export const server = express();
server.use(cors());
server.use(express.json());
server.use(
  express.urlencoded({
    extended: true,
  }),
);
server.use((_req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

server.get('/pass', (_req, res) => {
  res.json({ result: 'OK' });
  res.end();
});
server.get('/fail', (_req, res) => {
  res.json({ result: 'FAIL' });
  res.end();
});
