'use strict';

/**
   * @module 505
   * @param {object} err - err object for request
   * @param {object} req - request object
   * @param {object} res - response object
   * @desc server catch all route handler
   */
module.exports = (err, req, res) => {
  let error = { error: err };
  res.status(500).json(error).end();
};
