/* jshint node: true */
/* global require, module */
"use strict";

const EmptyObject = require('./utils/empty-object');
const Resolver = require('./resolver');

module.exports = class Namespace {

    constructor(options) {
        this.name = options.name;
        this.appName = options.appName;
        this.appPath = options.appPath;
        this.logger = options.logger;

        this._factories = new EmptyObject();
        this.resolver = new Resolver(this.appName, this.appPath, this.name);
        this.resolver.logger = this.logger;
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
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.ok('Resolved', name);
        }
        options = options || factory.options;
        if (factory.options.singleton) {
            factory.instance = factory.instance || this.instantiate(factory.Module, name);
            return factory.instance;
        }
        return factory.Module;
    }

    lookup(name, options) {
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.log(`Namespace.lookup('${name}')`);
        }
        if (this._factories[name]) {
            return Promise.resolve(this.resolveLookup(this._factories[name], name, options));
        }

        return this.resolver.require(name)
            .then((Module) => {
                this.register(name, Module.Module, Module.options);
                return this.resolveLookup(this._factories[name], name, options);
            });
    }

    lookupSync(name, options) {
        if (this.logger.config.LOG_LOOKUPS) {
            this.logger.log(`Namespace.lookupSync('${name}')`);
        }
        if (!this._factories[name]) {
            const Module = this.resolver.requireSync(name);
            this.register(name, Module.Module, Module.options);
        }

        return this.resolveLookup(this._factories[name], name, options);
    }

};
