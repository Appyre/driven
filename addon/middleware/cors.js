const methodOverride = require('method-override');

module.exports = {
    name: 'cors',
    applyMiddleware(express) {
        //Allow CORS & POST requests
        express.use(function(req, res, next) {

            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-access-token, X-Auth-Token');

            /*
            if ('OPTIONS' === req.method) {
                res.send(204);
            } else {
                next();
            }
            */
            next();
        });

    }
};
