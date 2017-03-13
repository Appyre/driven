const Token = require('./token');
const container = require('./container').container;
const Phase = require('./scheduler/phase');
const assert = require('../debug/assert');

class Scheduler {
  constructor() {
    this.token = new Token();

    const eventPhase = new Phase('event', ['-handle', 'write', 'read', 'response'], this.token);
    const idlePhase = new Phase('idle', ['task', 'idle', 'gc'], this.token);

    this.phases = {
      event: eventPhase,
      idle: idlePhase
    };

    this.currentPhase = null;
    this.nextMicroTick = null;
    this.nextMacroTick = null;
    this.jobCount = 0;

    this._mapQueueToPhase = {
      '-handle': eventPhase,
      write: eventPhase,
      read: eventPhase,
      response: eventPhase,
      task: idlePhase,
      idle: idlePhase,
      gc: idlePhase
    };
  }

  schedule(name, context, job, token) {
    assert(`You must supply a name to scheduler.schedule`, name && typeof name === 'string');
    assert(`You must supply a context to scheduler.schedule`, context && typeof context === 'object');
    assert(`You must supply a job to scheduler.schedule`, job && typeof job === 'function');
    assert(`The last arg can only be a Token`, !token || token instanceof Token);
    this.jobCount++;

    let phase;

    if (name === 'cleanup') {
      phase = this.currentPhase || this.phases.event;
    } else {
      phase = this._mapQueueToPhase[name];
    }

    assert(`You scheduled a job into ${name} but this queue does not exist!`, phase);

    switch (phase.name) {
      case 'event':
        this._scheduleEventFlush();
        break;
      case 'idle':
        this._scheduleIdleFlush();
        break;
      default:
        break;
    }

    return phase.push(name, context, job, token);
  }

  _scheduleEventFlush() {
    if (!this.nextMicroTick) {
      this.nextMicroTick = this.scheduleMicroTask(() => {
        // In production, we will be executing all tasks immediately and a task
        // may schedule the next event flush which will set the next MicroTick.
        // In development this won't happen, because tasks are wrapped in promises.
        // Either way, we want to unset the nextMicroTick handler first.
        this.nextMicroTick = undefined;

        this.setCurrentPhase(this.phases.event);
        this.phases.event.flush();
        this.setCurrentPhase(null);
      });
    }
  }

  _scheduleIdleFlush() {
    if (!this.nextMacroTick) {
      this.nextMacroTick = this.scheduleMacroTask(() => {
        // In production, we will be executing all tasks immediately and a task
        // may schedule the next event flush which will set the next MicroTick.
        // In development this won't happen, because tasks are wrapped in promises.
        // Either way, we want to unset the nextMicroTick handler first.
        this.nextMacroTick = undefined;

        this.setCurrentPhase(this.phases.idle);
        this.phases.idle.flush();
        this.setCurrentPhase(null);
      });
    }
  }

  scheduleMicroTask(cb) {
    let token = new Token(this.token);

    Promise.resolve().then(() => {
      if (token.isAlive) {
        cb();
      }
    });

    return token;
  }

  scheduleMacroTask(cb) {
    let token = new Token(this.token);

    setTimeout(() => {
      if (token.isAlive) { cb(); }
    }, 1);

    return token;
  }
}

module.exports = Scheduler;