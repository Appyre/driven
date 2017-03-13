/* jshint node: true */
/* global require, module */
"use strict";
const path = require('path');
const setOwner = require('./entanglement/owner').setOwner;
const dagIterate = require('./utils/dag-iterate');
const container = require('./entanglement/container').container;
const Logger = require('./entanglement/logger');

class Application {
  constructor(config) {
    setOwner(this, container);

    this.logger = new Logger(config.LOG);
    this.config = config;

    if (config.LOG.LOG_APP_BOOT) {
      this.logger.info('Booting ' + config.name, 'version ' + config.VERSION);
    }

    if (config.LOG.LOG_EXPRESS) {
      process.env['DEBUG'] = 'express:*';
    }

    config.appName = config.name;
    config.appPath = this.appPath = path.join(process.cwd(), config.modulePrefix);
    container.register('service:logger', this.logger, { singleton: true, instantiate: false });
    container.register('service:config', config, { singleton: true, instantiate: false });
    container.ready();

    // run driven initializers
    return container.loadFactories('driven/initializers')
      .then((initializers) => { return this._runInitializers(initializers); })
      // run app initializers
      .then(() => { return container.loadFactories('initializers'); })
      .then((initializers) => { return this._runInitializers(initializers); })
      .then(() => { return this._mount(); })
      .catch((e) => {
        console.log(e);
        if (this.logger) {
          this.logger.error(e);
        }
        throw new Error("Application Failed to Properly Initialize");
      });
  }

  _mount() {
    this.server.start().then(() => {
      this.onMount();
    });
  }

  onMount() {}

  _runInitializers(initializers) {
    return dagIterate(initializers, (initializer) => {
      if (this.config.LOG.LOG_INITIALIZERS) {
        this.logger.debug('Initializing', initializer.name);
      }
      return initializer.initialize(this, container);
    });
  }
}

module.exports = Application;
