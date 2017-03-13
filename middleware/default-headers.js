module.exports = {
  name: 'default-headers',

  applyMiddleware(express) {
    express.disable('x-powered-by');
  }
};
