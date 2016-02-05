export default class Action {

  constructor(router, route, req, res) {
    this._request = req;
    this._response = res;
    this.router = router;
    this.route = route;

    this.isRedirect = false;

    this._directive = Promise.defer();
  }

  redirect(isPermanent, should) {
    this.isRedirect = true;
  }

  error() {

  }

  respond() {

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
