'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Role = require('./roles-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/google.js');

const newRouter = express.Router();

/**
 * Get public stuff
 * @route GET /{model}
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.get('/public-stuff', auth(), (req, res) => {
  console.log('PUBLIC STUFF');
  res.status(200).send('Public-Stuff');
});

/**
 * Get hidden stuff
 * @route GET /{model}
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.get('/hidden-stuff', auth(), (req, res) => {
  console.log('HIDDEN STUFF');
  res.status(200).send('/hidden-stuff');
});

/**
 * Get something to read
 * @route GET /{model}
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.get('/something-to-read', auth('read'), (req, res) => {
  console.log('something-to-read');
  res.status(200).send('something-to-read');
});

/**
 * Post to create-a-thing
 * @route POST /{model}/{:id}
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.post('/create-a-thing', auth('create'), (req, res) => {
  console.log('create-a-thing');
  res.status(200).send('create-a-thing');
});

/**
 * Update something
 * @route PUT /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.put('/update', auth('update'), (req, res) => {
  console.log('update');
  res.status(200).send('update');
});

/**
 * Update something
 * @route PATCH /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.patch('/jp', auth('update'), (req, res) => {
  console.log('jp');
  res.status(200).send('jp');
});

/**
 * delete /bye-bye route
 * @route DELETE /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.delete('/bye-bye', auth('delete'), (req, res) => {
  console.log('bye-bye');
  res.status(200).send('bye-bye');
});

/**
 * get everything route
 * @route GET /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
newRouter.get('/everything', auth('superuser'), (req, res) => {
  console.log('everything');
  res.status(200).send('everything');
});

const capabilities = {
  admin: ['craete', 'update', 'delete', 'read', 'superuser'],
  editor: ['create', 'update', 'read'],
  users: ['read'],
};

/**
 * post route for /role
 * @route POST /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
authRouter.post('/role', () => {
  let saves = [];

  Object.keys(capabilities).map(role => {
    let newRecord = new Role({role, capabilities: capabilities[role]});
    saves.push(newRecord.save);
  });

  // run them all
  Promise.all(saves);
});

/**
 * signup a user
 * @route POST /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
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

/**
 * signin a user
 * @route GET /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
authRouter.get('/signin', auth(), (req, res) => {
  console.log(req.headers);
  res.cookie('auth', req.token);
  res.send(req.token);
});

/**
 * authenticate a user
 * @route GET /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
authRouter.get('/oauth', (req,res,next) => {
  oauth.authorize(req)
    .then( token => {
      res.status(200).send(token);
    })
    .catch(next);
});

/**
 * Save key
 * @route POST /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
authRouter.post('/key', auth, (req,res) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

module.exports = authRouter;
