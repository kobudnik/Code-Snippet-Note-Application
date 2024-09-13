/* eslint-disable no-unused-vars */
// IMPORTS
const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const { v4: uuidV4 } = require('uuid');
const userRouter = require('./routes/userRouter');
const snippedRouter = require('./routes/snippedRouter');
const sessionRouter = require('./routes/sessionRouter');
const folderRouter = require('./routes/folderRouter');

const PORT = 3000;

// MIDDLEWARE
const app = express();
app.use(express.json());
app.use(cors());

// const redisClient = createClient({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: process.env.REDIS_PORT || 6379,
// });

const redisClient = createClient({
  url: `redis://${
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : process.env.REDIS_HOST || 'redis'
  }:6379`,
});

// this always works in dev
// const redisClient = createClient({
//   url: `redis://localhost:6379`,
// });
redisClient.on('connect', function (err) {
  console.log('Connected to redis successfully');
});
redisClient.connect().catch(console.error);
redisClient.on('error', function (err) {
  console.log(`Could not establish a connection with redis. ${err} `);
});

const redisStore = new RedisStore({ client: redisClient });

// Initialize sesssion storage.
app.use(
  session({
    genid: () => uuidV4(),
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    name: '_redisDemo',
    secret: 'whatagatabetoosberry',
    cookie: { secure: false, maxAge: 60000 * 60 * 24 },
  }),
);

// Routes
app.use('/api/snipped', snippedRouter);
app.use('/api/user', userRouter);
app.use('/api/session', sessionRouter);
app.use('/api/folders', folderRouter);

// Serve all static files
app.use(express.static(path.resolve(__dirname, '../dist')));

// catch all to ensure refresh works
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'Global error handler invoked' },
  };
  const errorObj = { ...defaultErr, ...err };
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, (e) => {
  if (e) console.log(e);
  else {
    console.log(`Server listening on ${PORT}`);
  }
});
