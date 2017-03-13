const Token = require('../token');

class Phase {
  constructor(name, queueNames, parentToken) {
    this.token = parentToken;
    this.name = name;
    this.queueNames = queueNames;
    this.queues = Object.create(null);

    for (let i = 0; i < queueNames.length; i++) {
      this.queues[queueNames[i]] = [];
    }
  }

  push(name, context, job, parentToken) {
    let token = new Token(parentToken || this.token);
    this.queues[name].push(context, job, token);

    return token;
  }

  flush() {
    let jobs = 0;
    let executedJobs = 0;
    let queueNames = this.queueNames;
    let queues = this.queues;

    for (let i = 0, l = queueNames.length; i < l; i++) {
      let queue = queues[queueNames[i]];

      for (let j = 0; j < queue.length; j+=3) {
        jobs++;
        let context = queue[j];
        let job = queue[j + 1];
        let token = queue[j + 2];

        if (token.isAlive) {
          executedJobs++;
          job.call(context);
        }
      }

      queue.length = 0;
    }

    return {
      jobs,
      executedJobs
    };
  }

  clear() {
    let queueNames = this.queueNames;
    let queues = this.queues;

    for (let i = 0, l = queueNames.length; i < l; i++) {
      queues[i].length = 0;
    }
  }

  destroy() {
    this.clear();
    this.queues = null;
    this.queueNames = null;
  }
}

module.exports = Phase;