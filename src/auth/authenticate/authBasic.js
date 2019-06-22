'use strict';

const User = require('../users-model.js');
const _authenticate = require('./authenticate.js');
const _authError = require('./authError.js');

/**
 * @module _authBasic(authString)
 * @param {object} authString - Authorization string for basic authentication
 * @desc Handles creating auth information and calls User.authenticateBasic and handles the return
 */
module.exports = (req, str, capability, next) => {
  // str: am9objpqb2hubnk=
  let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
  let bufferString = base64Buffer.toString();    // john:mysecret
  let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
  let auth = {username, password}; // { username:'john', password:'mysecret' }

  return User.authenticateBasic(auth)
    .then(user => _authenticate(req, user, capability, next))
    .catch(() => _authError(next));
};
