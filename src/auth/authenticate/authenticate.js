'use strict';

const _authError = require('./authError.js');

module.exports = (user, capability) => {
  // if user is true
  // and one within the grouping is true
  // then it passes
  if ( user && (!capability || (user.can(capability))) ) {
    req.user = user;
    req.token = user.generateToken();
    next();
  }
  else {
    _authError();
  }
};
