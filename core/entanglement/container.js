const GarbageCollector = require('./gc');
const Scheduler = require('./scheduler');
const Token = require('./token');
const Resolver = require('./resolver');
const Namespace = require('./namespace');
const setOwner = require('./owner').setOwner;
const assert = require('../debug/assert');

class Container {
  constructor() {
    this.namespaces = Object.create(null);
    this.token = new Token();
    this._registry = Object.create(null);
    this.resolver = new Resolver();
    setOwner(this.resolver, this);

    this.register('service:scheduler', Scheduler, { singleton: true, instantiate: true });
    this.register('service:gc', GarbageCollector, { singleton: true, instantiate: true });

    this._isInitialized = false;
  }

  ready() {
    this.logger = this.lookupSync('service:logger');
    this.scheduler = this.lookupSync('service:scheduler');
    this.gc = this.lookupSync('service:gc');
    this._isInitialized = true;
  }

  register(containerKey, Factory, options) {
    this._registry[containerKey] = {
      name: containerKey,
      factory: Factory,
      instance: null,
      options
    };
  }

  log(level, ...args) {
    if (this._isInitialized && this.logger.config.LOG_LOOKUPS) {
      this.logger[level](...args);
    }
  }

  instantiate(Factory, name) {
    this.log('log', `Instantiating: ${name}`, Factory.create ? 'src:Factory.create()' : 'src:new Factory()');

    let instance = Factory.create ? Factory.create() : new Factory();
    setOwner(instance, this);

    return instance;
  }

  registerNamespace(name) {
    this.log('info', `Registering Namespace`, name);
    let namespace = this.namespaces[name] = new Namespace(name);
    setOwner(namespace, this);
    setOwner(namespace.resolver, this);
  }

  resolveLookup(resolution, name, options) {
    assert(`Unable to resolve module: ${name}`, resolution && resolution.factory);

    options = options || resolution.options || {};

    this.log('ok', 'Resolved', name);

    if (options.singleton && options.instantiate) {
      resolution.instance = resolution.instance || this.instantiate(resolution.factory, name);

      return resolution.instance;
    }

    if (options.instantiate) {
      return this.instantiate(resolution.factory, name);
    }

    return resolution.factory;
  }

  _lookup(name, sync, namespace, options) {
    if (namespace) {
      if (!this.namespaces[namespace]) {
        throw new Error(`You attempted to lookup '${name}' within the namespace '${namespace}', but that namespace does not exist!`);
      }
      return sync ? this.namespaces[namespace].lookupSync(name, options) : this.namespaces[namespace].lookup(name, options);
    }

    const methodName = sync ? 'lookupSync' : 'lookup';
    this.log('log', `Container.${methodName}('${name}')`);

    if (this._registry[name]) {
      const ret = this.resolveLookup(this._registry[name], name, options);

      return sync ? ret : Promise.resolve(ret);
    }

    if (sync) {
      const resolution = this.resolver.requireSync(name);
      this.register(name, resolution.Module, resolution.options);

      return this.resolveLookup(this._registry[name], name, options);
    }

    return this.resolver.require(name)
      .then(
        (resolution) => {
          this.register(name, resolution.Module, resolution.options);
          return this.resolveLookup(this._registry[name], name, options);
        },
        (error) => {
          this.log('error', `Container.${methodName}('${name}')`, 'unable to locate module');
          throw new Error(`Container.${methodName}('${name}'): unable to locate module`);
        });
  }

  lookup(name, namespace, options) {
    return this._lookup(name, false, namespace, options);
  }

  lookupSync(name, namespace, options) {
    return this._lookup(name, true, namespace, options);
  }

  loadFactories(type) {
    this.log('log', 'Container.lookupFactories:', type);

    return this.resolver.glob(type)
      .then((moduleResolutions) => {
        moduleResolutions.forEach((resolution) => {
          this._registry[`${type}:${resolution.name}`] = resolution.module;
        });
        return moduleResolutions;
      });
  }
}

module.exports = {
  Container,
  container: new Container()
};