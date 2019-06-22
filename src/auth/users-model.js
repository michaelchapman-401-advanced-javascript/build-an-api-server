'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles-model.js');

const SINGLE_USE_TOKENS = !!process.env.SINGLE_USE_TOKENS;
const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || '5m';
const SECRET = process.env.SECRET || 'foobar';

const usedTokens = new Set();

const capabilities = {
  admin: ['craete', 'update', 'delete', 'read', 'superuser'],
  editor: ['create', 'update', 'read'],
  users: ['read'],
};

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
}, {toObject:{virtuals:true}, toJSON:{virtuals:true}});

// {toObject:{virtuals:true}, toJSON:{virtuals:true}
// We do this because Mongoose says so
// If you have a virtual and don't include this then it won't work

// virtuals join two documents together
// Link the roles field in users to the role field in roles
users.virtual('acl', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'type',
  justOne: true,
});

users.pre('findOne', function() {
  try {
    this.populate('acl');
  }
  catch(e) {
    console.error('error', e);
  }
});

users.methods.can = function(capability) {
  // Given this role, does it include this capability?
  return this.acl.capabilities.include(capability);
};

users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {throw new Error(error);});
});

/**
 * @method createFromOauth()
 * @param {object} googleUser - passed in user info
 * @desc Create From Oauth function takes in a google users info and creates a user
 */
users.statics.createFromOauth = function(googleUser) {
  if(! googleUser) { return Promise.reject('Validation Error'); }

  let email = googleUser.email;
    
  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      return user;
    })
    .catch( () => {
      let username = email;
      let password = 'none';
      let role = 'user';
      return this.create({username, password, email, role});
    });
};

/**
 * @method authenticateToken()
 * @param {object} token - passed in token
 * @desc Runs checks to see if current token is valid
 */
users.statics.authenticateToken = function(token) {
  if ( usedTokens.has(token ) ) {
    return Promise.reject('Invalid Token');
  }
  
  try {
    let parsedToken = jwt.verify(token, SECRET);
    // The previous must be true for the next to run
    (SINGLE_USE_TOKENS) && parsedToken.type !== 'key' && usedTokens.add(token);
    let query = {_id: parsedToken.id};
    return this.findOne(query);
  } catch(e) { throw new Error('Invalid Token'); }
};

/**
 * @method authenticateBasic()
 * @param {object} auth - authentication/user info
 * @desc Runs checks to see if current user is in db and is using correct info
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

/**
 * @method authenticateBearer()
 * @param {object} token - passed in token
 * @desc Runs checks to see if current token can be used for access
 */
users.statics.authenticateBearer = function(token){
  if (usedTokens.has(token)) {
    return Promise.reject('Invalid token');
  }

  let parsedToken = jwt.verify(token, process.env.SECRET);

  parsedToken.type !== 'key' && usedTokens.add(token);

  let query = {_id: parsedToken.id};
  return this.findOne(query);
};

/**
 * @method comparePassword()
 * @param {object} password - users password
 * @desc Runs bcrypt to compare passed in password to one on file
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

/**
 * @method generateToken()
 * @param {object} type - Role of user.
 * @desc generates a token has specific capabilities
 */
users.methods.generateToken = function(type) {
  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    type: type || this.role || 'user',
  };
  
  let options = {};
  if ( type !== 'key' && !! TOKEN_EXPIRE ) { 
    options = { expiresIn: TOKEN_EXPIRE };
  }
  
  return jwt.sign(token, SECRET, options);
};

/**
 * @function anonymous()
 * @param {object} capability - users capability
 * @desc checks if the passed in capablity has a specific role
 */
users.methods.can = function(capability) {
  return this.acl.capabilities.includes(capability);
};

users.methods.generateKey = function() {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', users);
