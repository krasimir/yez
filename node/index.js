var app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 9172,
    TaskRunner = require('./TaskRunner'),
    path = require('path'),
    defaultCWD = path.normalize(process.cwd()),
    runners = {};

app.listen(port);

var getCurrentRunnersIds = function() {
    var res = [];
    if(runners) {        
        for(var id in runners) {
            res.push({id: id});
        }
    }
    return res;
}
var cleaningRunners = function() {
    var res = {};
    if(runners) {        
        for(var id in runners) {
            if(runners[id].ended === false) {
                res[id] = runners[id];
            }
        }
        runners = res;   
    }
}

io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    socket.emit('initial', { cwd: defaultCWD, running: getCurrentRunnersIds() });
    socket.on('data', function (data) {
        if(!data || !data.id) return;
        var id = data.id;
        switch(data.action) {
            case 'run-command':
                var runner = TaskRunner();
                runner.run(data.command, data.cwd || defaultCWD)
                .data(function(d) {
                    io.sockets.emit('response', {
                        action: 'data',
                        id: id,
                        data: d
                    });
                })
                .end(function(err, d, code) {
                    io.sockets.emit('response', {
                        action: 'end',
                        id: id,
                        err: err,
                        data: d,
                        code: code
                    }); 
                    runner.ended = true;
                    cleaningRunners();
                });
                if(!runners[id]) runners[id] = [];
                runners[id].push(runner);
            break;
            case 'stop-command':
                if(runners[id]) {
                    runners[id].forEach(function(r) {
                        r.stop();
                    });
                    delete runners[id];
                    cleaningRunners();                    
                }
            break;
            case 'list':
                var error = function(err) {
                    io.sockets.emit('beacon-response', {
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
                                        io.sockets.emit('beacon-response', {
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