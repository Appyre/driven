const bodyParser = require('body-parser');

module.exports = {
    name: 'body-parser',
    applyMiddleware(express) {
        express.use('*', bodyParser.json());
    }
};