module.exports = {
  name: 'server',

  initialize(application, owner) {
    return owner.lookup('service:server', null, { instantiate: false })
      .then((Server) => {
        application.server = new Server(owner,{
          allowHTTP: application.config.allowHTTP,
          httpPort: application.config.httpPort,
          httpsPort: application.config.httpsPort
        });
        return application.server.loadMiddleware();
      });
  }
};
