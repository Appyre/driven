const container = require('./entanglement/container').container;
const setOwner = require('./entanglement/owner').setOwner;
const getOwner = require('./entanglement/owner').getOwner;
const Token = require('./entanglement/token');

class CoreObject {
  constructor() {
    setOwner(this, container);
    this.token = new Token(container.token);
    this.init();
  }

  entangle(object) {
    getOwner(this).gc.entangle(this, object);
  }

  schedule(queueName, context, method) {
    if (!method) {
      method = context;
      context = this;
    }

    getOwner(this).scheduler.schedule(queueName, context, method, this.token);
  }

  init() {}

  willDestroy() {
    this.token.cancel();
  }

  destroy() {
    this.__gc.markForDestroy(this);
  }
}

module.exports = CoreObject;