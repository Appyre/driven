const bookshelf = require('bookshelf');

module.exports = {

    name: 'bookshelf',
    after: 'knex',

    initialize(application, container) {
        const connection = container.lookupSync('connection:pg');
        container.register('orm:bookshelf', bookshelf(connection), { singleton: true, instantiate: false });
    }

};