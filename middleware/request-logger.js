const Chalk = require('chalk');
process.env.FORCE_COLOR = true;
const chalk = new Chalk.constructor({ enabled: true });

module.exports = {
  name: 'request-logger',
  before: 'compression',

  applyMiddleware(express, _, owner) {
    express.use(function(req, res, next) {
      let shouldLogRequest = owner.logger.config.LOG_REQUEST;
      let shouldLogResponse = owner.logger.config.LOG_RESPONSE;

      logApiRequest(shouldLogRequest, req);

      let end = res.end;

      res.end = function() {
        end.apply(res, arguments);

        logApiResponse(shouldLogResponse, res, res.__body);
      };

    next();
  });

}
};


function colorBGForMethod(method) {
  switch (method) {
    case 'DELETE':
      return 'bgRed';
    case 'PUT':
      return 'bgYellow';
    case 'PATCH':
      return 'bgMagenta';
    case 'POST':
      return 'bgBlue';
    case 'GET':
      return 'bgGreen';
    default:
      return 'bgBlack';
  }
}

function colorForStatus(method) {
  switch (method) {
    case 206:
    case 200:
      return chalk.bgGreen.bold.white;
    case 404:
    case 405:
    case 403:
    case 406:
      return chalk.bgRed.bold.white;
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      return chalk.bgBlack.bold.red;
    case 204:
      return chalk.bgYellow.bold.white;
    case 202:
      return chalk.bgMagenta.bold.white;
    case 201:
      return chalk.bgBlue.bold.white;
    default:
      return chalk.bgCyan.bold.white;
  }
}


function iconForStatus(code) {
  if (code >= 500) {
    return '\🚨\t';
  }

  if (code >= 400) {
    return '\⚠️\t';
  }

  if (code >= 300) {
    return '\♻️\t';
  }

  return '\🚀\t';
}


function logApiRequest(shouldLog, req) {
  if (shouldLog) {
    console.log(
      chalk.bgWhite.black.bold(' >> ') + '\t' +
      chalk[colorBGForMethod(req.method)].bold.white(' ' + req.method + ' ') + ' ' +
      chalk.white(req.baseUrl || req.originalUrl || req.url) +
      chalk.yellow(req._parsedUrl.search || '')
    );
  }
}

function logApiResponse(shouldLog, res, payload) {
  if (shouldLog) {
    var response;
    if (payload) {
      var totalRecords = payload.data instanceof Array ? payload.data.length : 1;
      var includedRecords = payload.included ? payload.included.length : 0;
      response = chalk.cyan(
        ' ' + totalRecords + ' primary records, ' + includedRecords + ' included records'
      );
    } else {
      response = chalk.yellow('Request Returned an Empty Response');
    }

    console.log(
      chalk.bgBlack.grey.bold(' << ') + '\t' +
      iconForStatus(res.statusCode) +
      colorForStatus(res.statusCode)(' ' + res.statusCode + ' ' + res.statusMessage + ' ') +
      response
    );
  }
}
