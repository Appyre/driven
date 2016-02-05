"use strict";
class Cacheable {

    constructor(getter, setter) {
        this._value = null;
        this._shouldInvoke = true;
        this._getter = getter;
        this._setter = setter;
        this.key = null;
        this.context = null;
    }

    invalidate() {
        this._shouldInvoke = true;
    }

    get() {
        if (this._shouldInvoke) {
            this._value = this._getter.call(this.context);
            this._shouldInvoke = false;
        }
        return this._value;
    }

    set(value) {
        if (!this._setter) {
            return;
        }
        this._setter.call(this.context, value);
        this._shouldInvoke = true;
    }

    define() {
        return {
            writeable: false,
            enumerable: true,
            configurable: false,
            get: this.get.bind(this),
            set: this.set.bind(this)
        }
    }

}

class Computed {

    constructor(getter, setter) {
        this.isComputedFactory = true;
        this._cache = new Cacheable(getter, setter);
    }

    attach(obj, key) {
        this._cache.context = obj;
        this._cache.key = key;
        Object.defineProperty(obj, key, this._cache.define());
    }

}

module.exports = Computed;