/*global console, JSON*/
import chalk from 'chalk';

const logText = 'grey';
const debugText = 'green';
const errorText = 'white';
const warnText = 'white';
const infoText = 'green';

const logTitle = 'white';
const debugTitle = 'cyan';
const errorTitle = 'red';
const warnTitle = 'yellow';
const infoTitle = 'blue';

let Logger = class Logger {

  constructor() {
    // unlike methods, properties must be declared in the constructor
    this._logText = logText;
    this._debugText = debugText;
    this._errorText = errorText;
    this._warnText = warnText;
    this._infoText = infoText;

    this._debugTitle = debugTitle;
    this._errorTitle = errorTitle;
    this._warnTitle = warnTitle;
    this._infoTitle = infoTitle;

    // stores handlers
    this.__handlers = {
      log: [],
      debug: [],
      error: [],
      warn: [],
      info: []
    };
  }

  log(title, ...args) {
    this.emit('log', args.unshift(title));

  }

  debug(title, ...args) {
    this.emit('debug', args.unshift(title));
    console.log(
      chalk[this.debugTitle](title) +
      chalk[this.debugText](this.serialize(args)) + "\n"
    );
  }

  error(title,...args) {
    this.emit('error', args.unshift(title));
    console.log(
      chalk[this.errorTitle](title) +
      chalk[this.errorText](this.serialize(args)) + "\n"
    );
  }

  warn(title,...args) {
    this.emit('warn', args.unshift(title));
    console.log(
      chalk[this.warnTitle](title) +
      chalk[this.warnText](this.serialize(args)) + "\n"
    );
  }

  info(title, ...args) {
    this.emit('info', args.unshift(title));
    console.log(
      chalk[this.infoTitle](title) +
      chalk[this.infoText](this.serialize(args)) + "\n"
    );
  }

  static serialize(obj) {
    return JSON.stringify(obj, null, 2);
  }

  emit(event, ...args) {
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

};

export { Logger };

export default new Logger();
