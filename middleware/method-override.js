const methodOverride = require('method-override');

module.exports = {
    name: 'method-override',
    applyMiddleware(express) {
        express.use(methodOverride('X-HTTP-Method-Override'));
    }
};
