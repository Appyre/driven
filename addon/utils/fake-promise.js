module.exports = class FakePromise {

    constructor(method) {
        this._state = 0;
        this.__outcome = null;
        try {
            method(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }

    resolve(value) {
        if (this._state !== 0) {
            this.__swallow(value);
        }
        this._state = 1;
    }

    reject(error) {
        if (this._state !== 0) {
            this.__swallow(error);
        }
        this._state = 2;
    }

    then(successMethod, errorMethod) {

    }

    __swallow() {}

};

function makeChainable(method) {
    return function() {
        const result = method.apply(this, arguments);
        return new ChainableFunction
    }
}

class Thenable {
    constructor(context, method) {
        this._result = method.apply(context, arguments);
    }

    then(successMethod, errorMethod) {

    }
}