"use strict";

//  https://github.com/strongloop/express/blob/master/lib/application.js#L157-L174
module.exports = {
    name: 'socket-io',
    after: 'router',
    initialize(application, container) {
        return container.lookup('service:websockets')
            .then((ws) => {
                application.ws = ws;
                ws.httpServer = application.server.http;
                ws.start();
                return ws.loadMiddleware();
            });
    }
};