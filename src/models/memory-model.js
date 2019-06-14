'use strict';

const uuid = require('uuid/v4');

/**
 * @Class Memory Model
 * @desc memory model for get, post, put, delete requests to database for categories 
 */
class Model {

  /**
 * @constructor
 * @param {object} schema - schema from categories
 * @desc constructor creating schema and empty database
 */
  constructor(schema) {
    this.schema = schema;
    this.database = [];
  }

  /**
   * @method sanitize
   * @param {object} entry - Entry to be sanatized
   * @desc Sanatize entry
   */
  sanitize(entry) {

    let valid = true;
    let record = {};

    Object.keys(this.schema).forEach( field => {
      if ( this.schema[field].required ) {
        if (entry[field]) {
          record[field] = entry[field];
        } else {
          valid = false;
        }
      }
      else {
        record[field] = entry[field];
      }
    });
    
    return valid ? record : undefined;
  }
  
  /**
   * @method count
   * @desc Keep count of db
   */
  count() {
    return this.database.length;
  }

  /**
   * @method get
   * @param {string} _id - Id for specific entries
   * @desc Get one or all items from database
   */
  get(id) {
    const records = id ? this.database.filter( (record) => record._id === id ) : this.database;
    return Promise.resolve(records);
  }

  /**
   * @method post
   * @param {string} record - record containing information for what should be added
   * @desc Add an item to the database
   */
  post(entry) {
    entry._id = uuid();
    let record = this.sanitize(entry);
    if ( record._id ) { this.database.push(record); }
    return Promise.resolve(record);
  }

  /**
   * @method delete
   * @param {string} _id - Id for specific entries
   * @desc Delete an item out of database
   */
  delete(id) {
    this.database = this.database.filter((record) => record._id !== id );
    return this.get(id);
  }

  /**
   * @method put
   * @param {string} _id - Id for specific entries
   * @param {string} record - record containing information for what should be added
   * @desc Modify one item in database
   */
  put(id, entry) {
    let record = this.sanitize(entry);
    if( record._id ) { this.database = this.database.map((item) => (item._id === id) ? record : item  ); }
    return this.get(id);
  }
  
}

module.exports = Model;