/* jshint node: true */
/* global require, module */
"use strict";

const EmptyObject = require('./utils/empty-object');
const Resolver = require('./resolver');
const Namespace = require('./namespace');


module.exports = class Container {

    constructor(appName, appPath) {
        this.appName = appName;
        this.appPath = appPath;

        this.namespaces = new EmptyObject();
        this.logger = null;

        this._factories = new EmptyObject();
        this.resolver = new Resolver(appName, appPath);
    }

    registerNamespace(name) {
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.info(`Registering Namespace`, name);
        }
      this.namespaces[name] = new Namespace({
          name,
          appName: this.appName,
          appPath: this.appPath,
          logger: this.logger
      });
    }

    register(name, factory, options) {
        this._factories[name] = {
            name,
            options,
            Module: factory,
            instance: null
        };
    }

    instantiate(Module, name) {
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.log(`Instantiating: ${name}`, Module.create ? 'src:Module.create()' : 'src:new Module()');
        }
        return Module.create ? Module.create() : new Module();
    }

    resolveLookup(factory, name, options) {
        if (!factory || !factory.Module) {
            throw new Error("Unable to resolve module: " + name);
        }
        options = options || factory.options;
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.ok('Resolved', name);
        }
        if (options.singleton && options.instantiate) {
            factory.instance = factory.instance || this.instantiate(factory.Module, name);
            return factory.instance;
        }
        if (options.instantiate) {
            return this.instantiate(factory.Module, name);
        }
        return factory.Module;
    }

    _lookup(name, sync, namespace, options) {
        if (namespace) {
            if (!this.namespaces[namespace]) {
                throw new Error(`You attempted to lookup '${name}' within the namespace '${namespace}', but that namespace does not exist!`);
            }
            return sync ? this.namespaces[namespace].lookupSync(name, options) : this.namespaces[namespace].lookup(name, options);
        }

        const methodName = sync ? 'lookupSync' : 'lookup';
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.log(`Container.${methodName}('${name}')`);
        }

        if (this._factories[name]) {
            const ret = this.resolveLookup(this._factories[name], name, options);
            return sync ? ret : Promise.resolve(ret);
        }

        if (sync) {
            const Module = this.resolver.requireSync(name);
            this.register(name, Module.Module, Module.options);
            return this.resolveLookup(this._factories[name], name, options);
        }

        return this.resolver.require(name)
            .then(
                (Module) => {
                    this.register(name, Module.Module, Module.options);
                    return this.resolveLookup(this._factories[name], name, options);
                },
                (error) => {
                    this.logger.error(`Container.${methodName}('${name}')`, 'unable to locate module');
                    throw new Error(`Container.${methodName}('${name}'): unable to locate module`);
                });
    }

    lookup(name, namespace, options) {
        return this._lookup(name, false, namespace, options);
    }

    lookupSync(name, namespace, options) {
        return this._lookup(name, true, namespace, options);
    }

    loadModuleDirectory(type) {
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.log('Container.lookupFactories:', type);
        }
        return this.resolver.glob(type)
            .then((moduleResolutions) => {
                moduleResolutions.forEach((resolution) => {
                    this._factories[`${type}:${resolution.name}`] = resolution.module;
                });
                return moduleResolutions;
            });
    }

};