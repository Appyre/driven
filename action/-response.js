class HTTPError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.statusText = 'Bad Gateway';
  }
}

class FIVE_HUNDRED_ERROR extends HTTPError {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.statusText = 'Bad Gateway';
  }
}

module.exports = class Response {
  constructor(request, res) {
    this._request = request;
    this._res = res;
    this.data = null;
    this.errors = null;
    this.meta = null;
    this.links = null;
    this.included = null;
  }

  get statusCode() {
    return 200;
  }

  get headers() {
    return {
      'Content-Type': 'application/vnd.api+json'
    };
  }

  get statusText() {
    return 'OK';
  }

  get body() {
    return {};
  }

  status(code, message) {
    this._res.status(code || 200);
  }

  finalize() {
    let data = {
      data: this.data || {},
      meta: this.meta || {},
      links: this.links || {},
      included: this.included || []
    };

    this.status(200, 'ok');

    if (!data) {
      this._res.end();
    } else {
      this._res.__body = data;
      this._res.send(data);
    }

    return data;
  }
};
