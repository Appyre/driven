const Request = require('./-request');
const Response = require('./-response');
const chalk = require('chalk');
const Validator = require('jsonapi-validator').Validator;
const inject = require('../core/entanglement/inject');
const CoreObject = require('../core/core-object');
const path = require('path');

const Schema = require('./schema.json');
const validator = new Validator(Schema);

module.exports = class Action extends CoreObject {
  init() {
    inject(this, 'store');
  }

  _enter(req, res) {
    let request = new Request(req);
    let response = new Response(request, res);

    try {
      this.handle(request, response);
    } catch (e) {
      response.status(500, e.message);
    } finally {
      let payload = response.finalize();
      validateJsonApi(payload);
    }
  }

  handle() { throw new Error('NOT IMPLEMENTED'); }
};


function stringifyValidationError(e) {
  return chalk.cyan(e.keyword) + ' ' + chalk.white(e.message);
}

function validateJsonApi(json) {
  // will throw error if our payloads are wrong
  try {
    validator.validate(json);
  } catch (e) {
    console.log(chalk.red('Invalid json-api response detected'));
    console.log('original payload');
    console.log(chalk.grey(JSON.stringify(json, null, 2)));
    console.log(chalk.yellow('\n\nJSON API VALIDATION ERRORS' +
      '\n===========================\n'));

    for (var i = 0; i < e.errors.length; i++) {
      console.log('\t' + (i + 1) + ')\t' + stringifyValidationError(e.errors[i]));
    }
    console.log('\n');
  }

  return json;
}
