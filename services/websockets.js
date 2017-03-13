"use strict";
const io = require('socket.io');
const dagIterate = require('../core/utils/dag-iterate');
const inject = require('../core/entanglement/inject');
const getOwner = require('../core/get-owner');

//  https://github.com/strongloop/express/blob/master/lib/application.js#L157-L174
class WebSockets {
  constructor() {
    inject(this, 'logger');
    this.httpServer = null;
    this.httpsServer = null;
  }

  start() {
    if (this.logger.config.LOG_APP_BOOT) {
      this.logger.info('Running Websocket Setup');
    }
    this.io = io(this.httpServer, { origins : '*:*' });
    return Promise.resolve();
  }

  loadMiddleware() {
    return getOwner(this).loadFactories('driven/io-middleware')
      .then((wares) => { return this._applyWares(wares); })
  }

  _applyWares(wares) {
    return dagIterate(wares, (ware) => {
      if (this.logger.config.LOG_SOCKET_MIDDLEWARE) {
        this.logger.log('Applying IO Middleware', ware.name);
      }
      return ware.applyMiddleware(this.io)
    });
  }
}

module.exports = WebSockets;
