"use strict";
const EmptyObject = require('../../utils/empty-object');
const _bind = Function.prototype.bind;
const Computed = require('./computed');

class Primitive {

    constructor(/*...primitives*/) {
        for (var _len = arguments.length, primitives = Array(_len), _key = 0; _key < _len; _key++) {
            primitives[_key] = arguments[_key];
        }
        this.__primitives = primitives;
        this.__InternalClass = null;
        this.__meta = new EmptyObject();
        this.__meta.properties = new EmptyObject();
        this.__meta.methods = new EmptyObject();
        this.__meta.computeds = new EmptyObject();
        this.__construct();
    }

    compose(/*...primitives*/) {
        for (var _len = arguments.length, primitives = Array(_len), _key = 0; _key < _len; _key++) {
            primitives[_key] = arguments[_key];
        }
        primitives.unshift(this);
        return new (_bind.apply(Primitive, [null].concat(primitives)))();
    }

    reopen(/*...primitives*/) {
        for (var _len = arguments.length, primitives = Array(_len), _key = 0; _key < _len; _key++) {
            primitives[_key] = arguments[_key];
        }
        const Consolidated = new (_bind.apply(Primitive, [null].concat(primitives)))();
        const patch = Consolidated.__meta;

        this.__primitives.push(Consolidated);
        this._applyFromPrimitive(Consolidated);

        Primitive.__lock(patch, this.__InternalClass);
    }

    create(props) {
        const properties = Object.assign({}, this.__meta.properties, props || {});
        return new this.__InternalClass(properties);
    }

    __construct() {
        this.__primitives.forEach((primitive) => {
            this._applyPrimitive(primitive);
        });
        this.__InternalClass = Primitive.__lock(this.__meta);
    }

    static __lock(meta, ExistingClass) {
        function InternalClass(properties) {
            for(var i in properties) {
                if (properties.hasOwnProperty(i)) {
                    this[i] = properties[i];
                }
            }
            this.init();
        }
        const AppliedClass = ExistingClass || InternalClass;

        Object.keys(meta.computeds).forEach((key) => {
            const computed = meta.computeds[key];
            computed.attach(AppliedClass.prototype, key);
        });

        Object.keys(meta.methods).forEach((key) => {
            const method = meta.methods[key];
            AppliedClass.prototype[key] = method;
        });

        return AppliedClass;
    }

    _applyPrimitive(primitive) {
        if (primitive instanceof Primitive) {
            this._applyFromPrimitive(primitive);
        } else {
            this._applyFromObject(primitive);
        }
    }

    _applyFromPrimitive(primitive) {
        const meta = primitive.__meta;
        Object.assign(this.__meta.properties, meta.properties);
        Object.assign(this.__meta.methods, meta.methods);
    }

    _applyFromObject(obj) {
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] instanceof Computed || (obj[i] && obj[i].isComputedFactory)) {
                    this.__meta.computeds[i] = obj[i];
                } else if (typeof obj[i] === 'function') {
                    const superFn = this.__meta.methods[i];
                    this.__meta.methods[i] = wrapMethodForSuper(i, obj[i], superFn);
                } else {
                    this.__meta.properties[i] = obj[i];
                }
            }
        }
    }

}


function wrapMethodForSuper(key, method, superFn) {
    return function() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }
        this._super = this._super || new EmptyObject();
        this._super[key] = superFn || function() {};
        return method.apply(this, args);
    }
}

module.exports = Primitive;