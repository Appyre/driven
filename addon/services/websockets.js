"use strict";
const io = require('socket.io');
const DAG = require('dag-map');
const ContainerObject = require('../lib/object/container-object');


//  https://github.com/strongloop/express/blob/master/lib/application.js#L157-L174
module.exports = ContainerObject.compose({

    io: null,
    httpServer: null,

    start() {
        if (this.logger.config.LOG_APP_BOOT) {
            this.logger.info('Running Websocket Setup');
        }
        this.io = io(this.httpServer, { origins : '*:*' });
    },

    loadMiddleware() {
        return this.container.loadModuleDirectory('driven/io-middleware')
            .then((wares) => { return this._applyWares(wares); })
    },

    _applyWares(wares) {
        const graph = new DAG();
        const order = [];

        wares.forEach((ware) => {
            const module = ware.module;
            graph.addEdges(module.name, module, module.before, module.after);
        });

        graph.topsort((vertex) => {
            order.push(vertex.value);
        });

        return order.reduce((cur, next)  => {
            return cur.then(() => {
                if (this.logger.config.LOG_SOCKET_MIDDLEWARE) {
                    this.logger.log('Applying IO Middleware', next.name);
                }
                return next.applyMiddleware(this.io)
            });
        }, Promise.resolve());
    }

});
