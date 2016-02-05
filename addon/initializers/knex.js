const knex = require('knex');

module.exports = {

    name: 'knex',
    after: 'socket-io',

    initialize(application, container) {
        const pg = application.config.pg;
        const connection = knex({
            client: 'pg',
            connection: {
                host: pg.host || 'localhost',
                port: pg.port || 5432,
                user: pg.username || 'root',
                password: pg.password || '',
                database: pg.database || 'test',
                charset: pg.charset || 'utf8'
            }
        });
        container.register(
            'connection:pg',
            connection,
            { instantiate: false, singleton: true });
    }

};