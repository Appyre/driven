const compression = require('compression');

module.exports = {
  name: 'compression',

  applyMiddleware(express) {
    // TODO write a middleware for brotli instead
    express.use(compression());
  }
};
