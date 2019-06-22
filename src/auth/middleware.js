'use strict';

/**
   * @module middleware module
   * @param {object} req - request object
   * @param {object} res - response object
   * @desc contains all middleware
   */
module.exports = (capability) => {
  
  return (req, res, next) => {
    const _authBasic = require('./authenticate/authBasic.js'); 
    const _authBearer = require('./authenticate/authBearer.js');
    const _authError = require('./authenticate/authError.js');

    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);

      switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(req, authString, capability, next);
      case 'bearer':
        return _authBearer(req, authString, capability, next);
      default:
        return _authError(next);
      }
    } catch (e) {
      _authError();
    }
  };
};