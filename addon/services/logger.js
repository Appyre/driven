"use strict";

/*global console, JSON*/
const Chalk = require('chalk');
process.env.FORCE_COLOR = true;
const chalk = new Chalk.constructor({ enabled: true });

const logText = 'grey';
const debugText = 'grey';
const errorText = 'white';
const warnText = 'white';
const successText = 'grey';
const infoText = 'grey';

const logTitle = 'white';
const debugTitle = 'cyan';
const errorTitle = 'red';
const warnTitle = 'yellow';
const successTitle = 'green';
const infoTitle = 'magenta';

class Logger {

  constructor() {
    this.config = null;

    // unlike methods, properties must be declared in the constructor
    this._logText = logText;
    this._debugText = debugText;
    this._errorText = errorText;
    this._warnText = warnText;
    this._infoText = infoText;
    this._successText = successText;

    this._logTitle = logTitle;
    this._debugTitle = debugTitle;
    this._errorTitle = errorTitle;
    this._warnTitle = warnTitle;
    this._infoTitle = infoTitle;
    this._successTitle = successTitle;

    // stores handlers
    this.__handlers = {
      log: [],
      debug: [],
      error: [],
      warn: [],
      info: [],
      ok: []
    };
  }

  log(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('log', arguments);
    console.log(
        chalk[this._logTitle](title) + " " +
        chalk[this._logText](Logger.serialize(args))
    );
  }

  debug(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('debug', arguments);
    console.log(
      chalk[this._debugTitle](title) + " " +
      chalk[this._debugText](Logger.serialize(args))
    );
  }

  error(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('error', arguments);
    console.log(
      chalk[this._errorTitle](title) + " " +
      chalk[this._errorText](Logger.serialize(args))
    );
  }

  warn(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('warn', arguments);
    console.log(
      chalk[this._warnTitle](title) + " " +
      chalk[this._warnText](Logger.serialize(args))
    );
  }

  ok(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('ok', arguments);
    console.log(
        chalk[this._successTitle](title) + " " +
        chalk[this._successText](Logger.serialize(args))
    );
  }

  info(title) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.emit('info', arguments);
    console.log(
      chalk[this._infoTitle](title) + " " +
      chalk[this._infoText](Logger.serialize(args))
    );
  }

  static serialize(args) {
    if (!args.length) {
      return '';
    }
    const str = args.map((arg) => {
      return JSON.stringify(arg, null, 2);
    });
    return str.join("\n>\n");
  }

  emit(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    this.__handlers[event].forEach((handler) => {
      handler.apply(null, args);
    });
  }

  on(event, handler) {
    this.__handlers[event].push(handler);
  }

  off(event, handler) {
    let handlers = this.__handlers[event];
    let index = handlers.indexOf(handler);
    handlers.splice(index, 1);
  }

}

module.exports = Logger;
