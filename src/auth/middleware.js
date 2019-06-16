'use strict';

module.exports = (capability) => {
  
  return (req) => {
    const _authBasic = require('./authenticate/authBasic.js'); 
    const _authBearer = require('./authenticate/authBearer.js');
    const _authError = require('./authenticate/authError.js');

    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);

      switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString, capability);
      case 'bearer':
        return _authBearer(authString, capability);
      default:
        return _authError();
      }
    } catch (e) {
      _authError();
    }
  };
};