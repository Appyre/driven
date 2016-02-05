import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import express from 'express';
import http from 'http';
import compression from 'compression';

let Server = express();
http.Server(app);

Server.use(compression());
Server.disable('x-powered-by');

//Allow OPTIONS Requests
Server.use(methodOverride('X-HTTP-Method-Override'));

//Allow CORS & POST requests
Server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-access-token, X-Auth-Token');

  //handle OPTIONS here to avoid conflict with proxy
  if ('OPTIONS' === req.method) {
    res.send(204);
  } else {
    next();
  }
});

export default Server;
