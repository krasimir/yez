var app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 9172,
    TaskRunner = require('./TaskRunner');

app.listen(port);

io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    console.log('connection');
    // socket.emit('news', { hello: 'world' });
    socket.on('data', function (data) {
        if(!data) return;
        var id = data.id;
        switch(data.action) {
            case 'run-command': {
                var runner = TaskRunner();
                runner.run(data.command, __dirname)
                .data(function(d) { 
                    socket.emit('response', {
                        action: 'data',
                        id: id,
                        data: d
                    });
                })
                .end(function(err, d, code) {
                    socket.emit('response', {
                        action: 'end',
                        id: id,
                        err: err,
                        data: d,
                        code: code
                    });  
                });
            }
        }
    });
});

console.log('Yez is running!');