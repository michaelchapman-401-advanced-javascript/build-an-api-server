'use strict';

/**
   * @module _authError(user)
   * @param {object} user - user object containing user credentials
   * @desc Handles all auth errors
   */
module.exports = (next) => {
  console.log(next);
  next();
};
