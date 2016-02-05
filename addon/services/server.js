"use strict";

const Express = require('express');
const http = require('http');
const https = require('https');
const DAG = require('dag-map');
const ContainerObject = require('../lib/object/container-object');
const RSVP = require('rsvp');

module.exports = ContainerObject.compose({

    express: null,
    http: null,
    https: null,

    allowHTTP: false,
    httpPort: 80,
    httpsPort: 443,

    init() {

        if (this.logger.config.LOG_APP_BOOT) {
            this.logger.info('Running Server Setup');
        }
        this.express = Express();

        if (this.allowHTTP) {
            this.http = http.createServer(this.express);
        }

        const options = {
            key: this.container.lookupSync('key.pem'),
            cert: this.container.lookupSync('cert.pem')
        };

        this.https = https.createServer(options, this.express);
    },

    start() {
        if (this.logger.config.LOG_APP_BOOT) {
            this.logger.info('Starting Server');
        }
        const promises = {};

        if (this.allowHTTP) {
            promises.http = new Promise((resolve) => {
                if (this.logger.config.LOG_APP_BOOT) {
                    this.logger.info('Mounted HTTP Server', 'listening on *:' +  this.httpPort);
                }
                this.http.listen(this.httpPort, resolve);
            });
        }


        promises.https = new Promise((resolve) => {
            if (this.logger.config.LOG_APP_BOOT) {
                this.logger.info('Mounted HTTPS Server', 'listening on *:' +  this.httpsPort);
            }
            this.https.listen(this.httpsPort, resolve);
        });


        return RSVP.hash(promises);
    },

    loadMiddleware() {
        return this.container.loadModuleDirectory('driven/middleware')
            .then((wares) => { return this._applyWares(this.http, this.express, wares); })
    },

    _applyWares(http, server, wares) {
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
            if (this.logger.config.LOG_MIDDLEWARE) {
                this.logger.log('Applying Middleware', next.name);
            }
            return cur.then(() => {
                return next.applyMiddleware(server, http)
            });
        }, Promise.resolve());
    }

});