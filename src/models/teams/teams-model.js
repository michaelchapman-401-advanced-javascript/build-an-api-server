'use strict';

const Model = require('../mongo-model.js');
const schema = require('./teams-schema.js');

/**
   * @class Class
   * @desc Class class which inherits from Model
   */
class Teams extends Model {}

module.exports = new Teams(schema);

