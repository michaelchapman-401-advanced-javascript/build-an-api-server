'use strict';

const User = require('../users-model.js');
const _authenticate = require('./authenticate.js');
const _authError = require('./authError.js');

/**
   * @module _authBearer(user)
   * @param {object} authString - user object containing user credentials
   * @desc Handles authenticating a user and moves onto next middleware or returns and error
   */
module.exports = (req, authString, capability, next) => {
  return User.authenticateToken(authString)
    .then(user => _authenticate(req, user, capability, next))
    .catch(() => _authError(next));
};
