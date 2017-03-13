"use strict";

const Express = require('express');
const http = require('http');
const https = require('https');
const RSVP = require('rsvp');
const dagIterate = require('../core/utils/dag-iterate');

class Server {
  constructor(owner, config) {
    this.owner = owner;
    this.logger = owner.logger;
    this.express = Express();
    this.http = null;
    this.https = null;
    this.allowHTTP = config.allowHTTP || false;
    this.httpPort = config.httpPort || 80;
    this.httpsPort = config.httpsPort || 443;

    if (this.allowHTTP) {
      this.http = http.createServer(this.express);
    }

    // TODO always enforce HTTPS, add assertions!
    try {
      const httpOptions = {
        key: this.owner.lookupSync('key.pem'),
        cert: this.owner.lookupSync('cert.pem')
      };
      this.https = https.createServer(httpsOptions, this.express);
    } catch (e) {
      console.log('https unavailable :(');
    }
  }

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

    // TODO remove conditional when we enforce HTTPS
    if (this.https) {
      promises.https = new Promise((resolve) => {
        if (this.logger.config.LOG_APP_BOOT) {
          this.logger.info('Mounted HTTPS Server', 'listening on *:' +  this.httpsPort);
        }
        this.https.listen(this.httpsPort, resolve);
      });
    }

    if (!this.http && !this.https) {
      throw new Error('No HTTP or HTTPS Server was configured!');
    }

    return RSVP.hash(promises);
  }

  loadMiddleware() {
    return this.owner.loadFactories('driven/middleware')
      .then((wares) => { return this._applyWares(this.http, this.express, wares); })
  }

  _applyWares(http, server, wares) {
    return dagIterate(wares, (ware) => {
      if (this.logger.config.LOG_MIDDLEWARE) {
        this.logger.log('Applying Middleware', ware.name);
      }
      return ware.applyMiddleware(server, http, this.owner);
    });
  }
}

module.exports = Server;
