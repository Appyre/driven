const Primitive = require('../object/primitive');

module.exports = new Primitive({

    data: {
        find() {}
    },

    _enter(req, res) {
        res.status(200).send( this.handle() );
    },

    handle() {

    }
});