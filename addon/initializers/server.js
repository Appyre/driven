module.exports = {

    name: 'server',

    initialize(application, container) {
        return container.lookup('service:server', null, { instantiate: false })
            .then((Server) => {
                application.server = Server.create({
                    allowHTTP: application.config.allowHTTP,
                    httpPort: application.config.httpPort,
                    httpsPort: application.config.httpsPort
                });
                return application.server.loadMiddleware();
            });
    }

};