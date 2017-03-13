"use strict";

//  https://github.com/strongloop/express/blob/master/lib/application.js#L157-L174
module.exports = {
  name: 'socket-io',
  after: 'router',
  initialize(application, owner) {
    return owner.lookup('service:websockets')
      .then((ws) => {
        application.ws = ws;
        ws.httpServer = application.server.http;

        return ws.start()
          .then(() => {
            return ws.loadMiddleware();
          });
      });
  }
};
