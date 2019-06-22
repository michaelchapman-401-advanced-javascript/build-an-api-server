'use strict';

const _authError = require('./authError.js');

/**
   * @module _authenticate(user)
   * @param {object} user - user object containing user credentials
   * @desc Handles authenticating a user and moves onto next middleware or returns and error
   */
module.exports = (req, user, capability, next) => {
  // if user is true
  // and one within the grouping is true
  // then it passes
  if ( user && (!capability || (user.can(capability))) ) {
    req.user = user;
    req.token = user.generateToken();
    next();
  }
  else {
    _authError(next);
  }
};
