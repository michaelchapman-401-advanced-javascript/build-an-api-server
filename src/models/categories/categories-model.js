'use strict';

const Model = require('../memory-model.js');

/**
 * @typedef categories-model
 * @property {schema} - Model schema from child Class
 */
const schema = {
  _id: {required:true},
  name: {required:true},
};

/**
 * @Class Categories Model
 * @property {class} - class extends from model
 */
class Categories extends Model {}

module.exports = new Categories(schema);
