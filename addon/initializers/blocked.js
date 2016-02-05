const blocked = require('blocked');

module.exports = {

    name: 'blocked',

    initialize(application) {
        blocked((ms) => {
            ms = ms | 0;
            application.logger.error('THREAD BLOCKED', `${ms}ms`);
        });
    }

};