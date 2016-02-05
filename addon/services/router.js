"use strict";

const ContainerObject = require('../lib/object/container-object');
const path = require('path');

class EndpointContext {

    constructor(container, name, namespace, options, server) {
        this.name = name;
        this.container = container;
        this.namespace = namespace;
        this.options = options;
        options.endpointPath = options.endpointPath || '';
        this.mount = server;
    }

    action(name, options) {
        if (!options) {
            options = {};
        }
        options.path = options.path || `/${name}`;
        options.method = (options.method || 'GET').toUpperCase();

        const moduleName = this.options.endpointPath + name;
        const route = this.container.lookupSync(`action:${moduleName}`, this.namespace);
        const url = path.join(this.options.fullPath, options.path);

        if (this.container.logger.config.LOG_ACTION_REGISTRATION) {
            this.container.logger.ok('Action', options.method + ' ' + url);
        }

        this.mount[options.method.toLowerCase()](url, function(req, res) {
            route._enter(req, res);
        });
    }

    endpoint(name, options, applyActions) {
        if (!applyActions) {
            applyActions = options;
            options = {
                path: `/${name}`
            };
        }
        options.fullPath = this.options.fullPath + options.path;
        options.endpointPath = this.options.endpointPath + name + '/';
        const endpoint = new EndpointContext(this.container, name, this.namespace, options, this.mount);
        applyActions.call(endpoint);
    }

}

class MapContext {

    constructor(container, server) {
        this.container = container;
        this.server = server;
    }

    namespace(name, options, generate) {
        if (!generate) {
            generate = options;
            options = {};
        }
        options.path = options.path || `/api/${name}`;
        options.fullPath = options.path;
        this.container.registerNamespace(name);
        const endpoint = new EndpointContext(this.container, '', name, options, this.server);

        generate.call(endpoint);
    }

    action() {
        throw new Error("Actions MUST be contained within a namespace.");
    }

    endpoint() {
        throw new Error("Endpoints MUST be contained within a namespace.");
    }

}

function logRoutes(stack, logger) {
    stack.forEach((r) => {
        if (r.route && r.route.path) {
            logger.log('ROUTE', r.route.path);
        }
    });
}

module.exports = ContainerObject.compose({

    init() {
        const context = new MapContext(this.container, this.server.express);
        this.map.call(context);
        // logRoutes(this.server.express._router.stack, this.logger);
    },

    map() {},

    triggerAction(request) {
        return new Promise((resolve, reject) => {
            let response = {};
            this.server.handle(request, response, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve (response);
                }
            });
        });
    }

});