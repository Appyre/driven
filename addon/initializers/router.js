module.exports = {

    name: 'router',
    after: 'server',

    initialize(application, container) {
        return container.lookup('router')
            .then((Router) => {
               application.router = Router.create({
                   server: application.server
               });
            });
    }

};