module.exports = {
  name: 'router',
  after: 'server',

  initialize(application, owner) {
    return owner.lookup('service:router', null, { instantiate: false })
      .then((Router) => {
        application.router = new Router({
          server: application.server,
          owner,
          logger: owner.logger
        });
      });
  }
};
