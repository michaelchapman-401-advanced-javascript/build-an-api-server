'use strict';

const User = require('./users-model.js');
const _authenticate = require('./authenticate.js');
const _authError = require('./authError.js');

module.exports = (authString, capability) => {
  return User.authenticateToken(authString)
    .then(user => _authenticate(user, capability))
    .catch(_authError);
};
