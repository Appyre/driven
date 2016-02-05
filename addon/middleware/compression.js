const compression = require('compression');

module.exports = {
    name: 'compression',

    applyMiddleware(express) {
        express.use(compression());
    }
};
