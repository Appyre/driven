const assert = require('../debug/assert');
const OWNABLES = ['object', 'array', 'function'];
const inject = require('./inject');

function isOwnableObject(object) {
  let type = typeof object;

  return object && OWNABLES.indexOf(type) !== -1;
}

class Context {
  constructor(object) {
    this.object = object;
    this._owns = new Set();
    this._ownedBy = new Set();
    this._contains = new Set();
    this._owner = null;
    this._destroyed = false;
    this._isDestroying = false;
  }

  get isAlive() {
    return !this._isDestroying && !this._destroyed;
  }

  get owner() {
    return this._owner;
  }

  set owner(owner) {
    if (owner) {
      assert(`Cannot set an entangled owner on an already owned object.`, !this._owner);
      assert(`Cannot set an entangled owner on an object owned elsewhere`, this._ownedBy.size === 0);
    }
    this._owner = owner;
  }

  entangle(child) {
    this._contains.add(child);
  }

  dissassociate(child) {
    this._contains.delete(child);
  }

  addOwner(parent) {
    assert(`Cannot add an owner to an entangled object.`, !this._owner);
    this._ownedBy.add(parent);
  }

  removeOwner(parent) {
    this._ownedBy.delete(parent);
  }

  claim(child) {
    this._owns.add(child);
  }

  release(child) {
    this._owns.delete(child);
  }

  markForDestroy() {
    assert(`Cannot mark destroy an already destroyed object for destruction.`, !(this._destroyed || this._isDestroying));
    assert(`Cannot mark an owned object for destruction.`, this._ownedBy.size === 0);
    assert(`Cannot mark an entangled object for destruction.`, !this._owner);
    this._isDestroying = true;

    let entangled = this._contains.values();

    this._contains.forEach((childContext) => {
      childContext.owner = null; // should we do this in destroy?
      let alsoEntangled = childContext.markForDestroy();
      entangled.unshift(...alsoEntangled);
    });

    if (typeof this.object.willDestroy === 'function') {
      this.object.willDestroy();
    }

    return entangled;
  }

  destroy() {
    assert(`Cannot destroy a destroyed object.`, !this._destroyed);
    assert(`Cannot destroy an object not marked for destruction.`, this._isDestroying);

    // disassociate
    this._contains.clear();
    this._owns.forEach((childContext) => {
      childContext.removeOwner(this);
    });

    if (typeof this.object._destroy === 'function') {
      this.object._destroy();
    }

    this.object = null;
    this._destroyed = true;
  }
}


class GarbageCollector {
  constructor() {
    this.contexts = new Map();
    this.destroyableContexts = [];
    this._nextSweep = null;

    inject(this, 'scheduler');
  }

  _getContext(obj) {
    assert(`The GarbageCollector cannot monitor the given item: ${obj}`, isOwnableObject(obj));
    let context = this.contexts.get(obj);
    if (!context) {
      context = new Context(obj);
      this.contexts.set(obj, context);
    } else {
      assert(`Cannot reclaim an item already marked for destruction: ${obj}`, context.isAlive);
    }

    return context;
  }

  markForDestroy(obj) {
    let context = this._getContext(obj);
    let entangled = context.markForDestroy();
    this.destroyableContexts.push(context, ...entangled);

    if (!this._nextSweep) {
      this._nextSweep = this.scheduler.schedule('gc', this, this.sweep);
    }
  }

  claim(parent, child) {
    let parentContext = this._getContext(parent);
    let childContext = this._getContext(child);

    parentContext.claim(child);
    childContext.addOwner(parent);
  }

  release(parent, child) {
    let parentContext = this._getContext(parent);
    let childContext = this._getContext(child);

    parentContext.release(child);
    childContext.removeOwner(parent);
  }

  entangle(parent, child) {
    let parentContext = this._getContext(parent);
    let childContext = this._getContext(child);

    parentContext.entangle(child);
    childContext.owner = parent;
  }

  dissassociate(parent, child) {
    let parentContext = this._getContext(parent);
    let childContext = this._getContext(child);

    parentContext.dissassociate(child);
    childContext.owner = null;
  }

  sweep() {
    let toDestroy = this.destroyableContexts;

    for (let i = 0; i < toDestroy.length; i++) {
      let context = toDestroy[i];
      context.destroy();
    }

    toDestroy.length = 0;
    this._nextSweep = null;
  }
}

module.exports = GarbageCollector;