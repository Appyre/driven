import ContainerClass from './-container';
import RSVP from 'rsvp';
import HttpError from 'standard-http-error';
import attempt from '../utils/attempt';

const {
  Promise
  } = RSVP;

export default class Route extends ContainerClass {

  constructor() {
    super();
  }

  __handle(action, model) {
    attempt(this.beforePerform, action)
      .then(() => { return this.perform(model.page, model.params, model.body); })
      .then((response) => {
          return attempt(this.afterPerform, response, action)
            .then(() => { return response; });
        })
      .then((response) => { this.__send(action, response); })
      .catch((error) => {
         this.__send(action, null, error);
        });
  }

  beforePerform(/*transition*/) {}

  perform(page /*,params, body*/) {
    return Promise.reject(new HttpError(501, "This API Endpoint Has Not Been Implemented"));
  }

  afterPerform() {}

  __beforeResponse() {

  }

  __send(action, response, error) {
    action.respond(response, error);
  }

  __getStatusCode(error) {
    if (!error) {
      switch (this.method) {
        case 'POST':
          return 201;
        case 'PUT':
        case 'PATCH':
          return this.async ? 202: 200;
        case 'DELETE':
          return this.async ? 202: 204;
        case 'GET':
        default:
          return 200;
      }
    }

    return error.code || 500;
  }

}
