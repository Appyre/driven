/* jshint node: true */
/* global require, module */
"use strict";

const Resolver = require('./resolver');
const setOwner = require('./owner').setOwner;
const getOwner = require('./owner').getOwner;
const inject = require('./inject');

module.exports = class Namespace {
  constructor(name) {
    this.name = name;

    inject(this, 'logger');

    this._registry = Object.create(null);
    this.resolver = new Resolver(name);
  }

  register(name, factory, options) {
    this._registry[name] = {
      name,
      options,
      Module: factory,
      instance: null
    };
  }

  instantiate(Factory, name) {
    if (this.logger.config.LOG_LOOKUPS) {
      this.logger.log(`Instantiating: ${name}`, Factory.create ? 'src:Factory.create()' : 'src:new Factory()');
    }

    let instance = Factory.create ? Factory.create() : new Factory();
    let owner = getOwner(this);
    setOwner(instance, owner);

    return instance;
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
    if (this._registry[name]) {
      return Promise.resolve(this.resolveLookup(this._registry[name], name, options));
    }

    return this.resolver.require(name)
      .then((Module) => {
        this.register(name, Module.Module, Module.options);
        return this.resolveLookup(this._registry[name], name, options);
      });
  }

  lookupSync(name, options) {
    if (this.logger.config.LOG_LOOKUPS) {
      this.logger.log(`Namespace.lookupSync('${name}')`);
    }
    if (!this._registry[name]) {
      const Module = this.resolver.requireSync(name);
      this.register(name, Module.Module, Module.options);
    }

    return this.resolveLookup(this._registry[name], name, options);
  }
};
