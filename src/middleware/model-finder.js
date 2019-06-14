'use strict';

/**
   * @module model-finder
   * @param {object} req - request object
   * @param {object} res - response object
   * @param {function} next - next function which calls next middleware
   * @desc Middleware that gets modelnames for pathing
   */
module.exports = (req,res,next) => {
  let modelName = req.params.model.replace(/[^a-z0-9-_]/gi, '');
  req.model = require(`../models/${modelName}/${modelName}-model.js`);
  next();
};
