module.exports = {
    name: 'express-bridge',
    applyMiddleware(io) {
        io.sockets.on('connection', function(socket) {
/*
            socket.on('authenticate-token', function(data, callback) {
                // check the token is valid
            });

            socket.on('ajax', function (data, callback) {
                if (socket.authenticated) {

                    if (!data || !callback || !data.url || !data.method) {
                        callback({
                            status: false,
                            message: 'Invalid Query'
                        });
                        return;
                    }

                    // url normalization
                    if (data.url.indexOf('http') !== 0) {
                        if (data.url.indexOf('/') !== 0) {

                            if (logDeprecations) {
                                console.log(
                                    chalk.yellow('[DEPRECATED BEHAVIOR] socket:ajax:: relative urls will not longer be prepended with `/`' )
                                );
                            }

                            data.url = '/' + data.url;
                        }
                        data.url = serverUrl + data.url;

                        if (logDeprecations) {
                            console.log(
                                chalk.yellow('[DEPRECATED BEHAVIOR] socket:ajax:: relative urls will not longer be prepended with the server url.' )
                            );
                        }

                    }



                    data.headers = data.headers || {};
                    data.headers.Cookie = data.headers.Cookie || socket.session.cookie;
                    pajax(data).then(
                        function(res) {
                            callback({
                                status: true,
                                message: 'OK',
                                content: res
                            });
                        },
                        function(res) {
                            callback({
                                status: false,
                                message: 'Error',
                                content: res
                            });
                        }

                    );

                } else {
                    callback({
                        status : false,
                        message : 'You need to login again.',
                        error : 'unauthenticated'
                    });
                }

            });

            socket.on('api-request', function() {

            });
*/
        });

    }
};