'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Role = require('./roles-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/google.js');

const newRouter = express.Router();

// only put stuff in auth if no need for restriction
newRouter.get('/public-stuff', auth(), (req, res) => {
  console.log('PUBLIC STUFF');
  res.status(200).send('Public-Stuff');
});

newRouter.get('/hidden-stuff', auth(), (req, res) => {
  console.log('HIDDEN STUFF');
  res.status(200).send('/hidden-stuff');
});

newRouter.get('/something-to-read', auth('read'), (req, res) => {
  console.log('something-to-read');
  res.status(200).send('something-to-read');
});

newRouter.post('/create-a-thing', auth('create'), (req, res) => {
  console.log('create-a-thing');
  res.status(200).send('create-a-thing');
});

newRouter.put('/update', auth('update'), (req, res) => {
  console.log('update');
  res.status(200).send('update');
});

newRouter.patch('/jp', auth('update'), (req, res) => {
  console.log('jp');
  res.status(200).send('jp');
});

newRouter.delete('/bye-bye', auth('delete'), (req, res) => {
  console.log('bye-bye');
  res.status(200).send('bye-bye');
});

newRouter.get('/everything', auth('superuser'), (req, res) => {
  console.log('everything');
  res.status(200).send('everything');
});

const capabilities = {
  admin: ['craete', 'update', 'delete', 'read', 'superuser'],
  editor: ['create', 'update', 'read'],
  users: ['read'],
};

authRouter.post('/role', (req, res, next) => {
  let saves = [];

  Object.keys(capabilities).map(role => {
    let newRecord = new Role({role, capabilities: capabilities[role]});
    saves.push(newRecord.save);
  });

  // run them all
  Promise.all(saves);
});

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    })
    .catch(next);
});

authRouter.get('/signin', auth(), (req, res) => {
  console.log(req.headers);
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/oauth', (req,res,next) => {
  oauth.authorize(req)
    .then( token => {
      res.status(200).send(token);
    })
    .catch(next);
});

authRouter.post('/key', auth, (req,res) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

module.exports = authRouter;
