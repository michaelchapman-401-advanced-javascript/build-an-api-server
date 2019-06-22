'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Role = require('./roles-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/google.js');

/**
 * post route for /role
 * @route POST /{model}/
 * @consumes application/json application/xml
 * @returns {Object} 500 - Server error
 * @returns {Object} 200 - { count: 2, results: [{}, {}]}
 */
authRouter.post('/role', (req, res, next) => {
  let role = new Role(req.body);

  role.save()
    .then(result => {
      res.status(200).send(result);
    })
    .catch(next);

  // Object.keys(capabilities).map(role => {
  //   let newRecord = new Role({role, capabilities: capabilities[role]});
  //   saves.push(newRecord.save);
  // });

  // // run them all
  // Promise.all(saves);
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
  console.log('HELLO');
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
