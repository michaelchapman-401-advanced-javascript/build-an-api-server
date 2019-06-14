'use strict';

/**
   * @module 404
   * @param {object} req - request object
   * @param {object} res - response object
   * @desc server error handler
   */
module.exports = (req,res) => {
  let error = { error: 'Resource Not Found' };
  res.status(404).json(error).end();
};
