module.exports = {

    name: 'store',
    after: 'bookshelf',

    initialize(application, container) {
        return container.lookup('service:store')
            .then((store) => {
                console.log(store.io);
            });
    }

};