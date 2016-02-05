/* jshint node: true */
/* global require, module */
"use strict";

const path = require('path');
const RSVP = require('RSVP');
const DAG = require('dag-map');
const Container = require('./container');
const DrivenObject = require('./lib/object/object');
const ContainerObject = require('./lib/object/container-object');
const Logger = require('./services/logger');

module.exports = DrivenObject.compose({

    config: null,
    pathForApp: null,
    __container: null,
    logger: null,
    server: null,

    init() {
        this.logger = new Logger();
        this.logger.config = this.config.LOG;

        if (this.config.LOG.LOG_APP_BOOT) {
            this.logger.info('Booting ' + this.config.name, 'version ' + this.config.VERSION);
        }

        if (this.config.LOG.LOG_EXPRESS) {
            process.env['DEBUG'] = 'express:*';
        }

        // set up Container
        this.pathForApp = path.join(process.cwd(), this.config.modulePrefix);
        this.__container = new Container(this.config.name, this.pathForApp);
        this.__container.logger = this.logger;
        this.__container.resolver.logger = this.logger;

        ContainerObject.reopen({
            container: this.__container,
            logger: this.logger
        });

        // run driven initializers
        return this.__container.loadModuleDirectory('driven/initializers')
            .then((initializers) => { return this._runInitializers(initializers); })
            // run app initializers
            .then(() => { return this.__container.loadModuleDirectory('initializers'); })
            .then((initializers) => { return this._runInitializers(initializers); })
            .then(() => { this._mount(); })
            .catch((e) => {
                if (this.logger) {
                    this.logger.error(e);
                }
                throw new Error("Application Failed to Properly Initialize");
            });
    },

    _mount() {
        this.server.start().then(() => {
            this.onMount();
        });
    },

    onMount() {},

    _runInitializers(initializers) {
        const graph = new DAG();
        const order = [];

        initializers.forEach((initializer) => {
            const module = initializer.module;
            graph.addEdges(module.name, module, module.before, module.after);
        });

        graph.topsort((vertex) => {
            order.push(vertex.value);
        });

        return order.reduce((cur, next)  => {
            return cur.then(() => {
                if (this.config.LOG.LOG_INITIALIZERS) {
                    this.logger.debug('Initializing', next.name);
                }
                return next.initialize(this, this.__container);
            });
        }, Promise.resolve());
    }

});
