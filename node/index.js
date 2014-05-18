var app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 9172,
    TaskRunner = require('./TaskRunner'),
    path = require('path'),
    defaultCWD = path.normalize(process.cwd());

app.listen(port);

io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    socket.emit('cwd', { cwd: defaultCWD });
    socket.on('data', function (data) {
        if(!data) return;
        var id = data.id;
        switch(data.action) {
            case 'run-command':
                var runner = TaskRunner();
                runner.run(data.command, data.cwd || defaultCWD)
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
            break;
            case 'list':
                var error = function(err) {
                    socket.emit('beacon-response', {
                        id: id,
                        err: err
                    });
                }
                try {
                    fs.exists(data.cwd, function(ex) {
                        ex ? read() : error('Path does\'t exists.');
                    })
                    var read = function() {
                        fs.readdir(data.cwd, function(err, files) {
                            if(err) {
                                error(err);
                            } else {
                                var result = [];
                                (function checkForDir() {
                                    if(files.length == 0) {
                                        socket.emit('beacon-response', {
                                            id: id,
                                            files: result
                                        });
                                    } else {
                                        var item = files.shift();
                                        fs.stat(data.cwd + '/' + item, function(err, stats) {
                                            if(err) { 
                                                error(err);                                                 
                                            } else {
                                                if(stats.isDirectory()) {
                                                    result.push(item);
                                                }
                                            }
                                            checkForDir();
                                        });
                                    }
                                })();
                            }
                        });
                    }
                    
                } catch(err) {
                    error(err);
                }
            break;
        }
    });
});

console.log('Yez is running!');