#!/usr/bin/env node

var app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 9172,
    TaskRunner = require('./TaskRunner'),
    path = require('path'),
    defaultCWD = path.normalize(process.cwd()),
    runners = {}, 
    lastActive = 0,
    electron = require('electron-prebuilt'),
    spawnElectron,
    proc = require('child_process'),
    argv = require('yargs').argv;

app.listen(port);

var getCurrentRunnersIds = function() {
    cleaningRunners();
    var res = [];
    if(runners) {        
        for(var id in runners) {
            res.push({id: id});
        }
    }
    return res;
};
var cleaningRunners = function() {
    var res = {};
    if(runners) {        
        for(var id in runners) {
            var stillRunning = false;
            for(var i=0; i<runners[id].length; i++) {
                 if(runners[id][i].ended === false) {
                    stillRunning = true;
                 }
            }
            if(stillRunning) {
                res[id] = runners[id];
            }
        }
        runners = res;
    }
};
var reportingProcesses = function() {
    var active = 0;
    if(runners) {        
        for(var id in runners) {
            var stillRunning = false;
            for(var i=0; i<runners[id].length; i++) {
                 if(runners[id][i].ended === false) {
                    stillRunning = true;
                 }
            }
            if(stillRunning) {
                active += 1;
            }
        }
        if(active != lastActive) {
            lastActive = active;
            console.log('Running processes: ' + active);
        }
    }
    setTimeout(reportingProcesses, 1600);
};

var savedTasks; //savedTasks.json data

var readTasks = function () {
    fs.readFile(path.resolve(__dirname+'/savedTasks.json'), 'utf8', function (err, data) {
        if (err) throw err;
        savedTasks = data;        
    });
};

readTasks();

var startElectron = function () {
    if (!spawnElectron) {
        spawnElectron = proc.spawn(electron, [
            path.resolve(__dirname + '/../electron'), 
            process.pid, 
            argv.tray, 
            argv.dark
        ]);
        spawnElectron.on('close', function () {
             spawnElectron = null;
        });
    }
};

if (argv.tray) startElectron();

io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    socket.emit('initial', { 
      cwd: defaultCWD,
      tasks: savedTasks,
      running: getCurrentRunnersIds(),
      sep: path.sep
    });    
    if (argv.tray) socket.emit('tray', {checked: 'true'});
    if (argv.dark) socket.emit('theme', {theme: 'dark'});
    socket.on('data', function (data) {
        if(!data || !data.id) return;
        var id = data.id;
        switch(data.action) {
            /********************************************************************** run command */
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
                .err(function(data) {
                    io.sockets.emit('response', {
                        action: 'err',
                        id: id,
                        msg: data
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
                    cleaningRunners();
                })
                .exit(function(code, signal) {
                    io.sockets.emit('response', {
                        action: 'exit',
                        id: id,
                        signal: signal,
                        code: code
                    });
                    cleaningRunners();
                });
                if(!runners[id]) runners[id] = [];
                runners[id].push(runner);
            break;
            /********************************************************************** stop command */
            case 'stop-command':
                if(runners[id]) {
                    runners[id].forEach(function(r) {
                        r.stop();
                    });                    
                } else {
                    io.sockets.emit('response', {
                        action: 'end',
                        id: id,
                        err: { err: 'Stopped' },
                        data: [],
                        code: null
                    });
                }
            break;
            /********************************************************************** stdin */
            case 'stdin-input': 
                if(runners[id]) {
                    var res = 0;
                    runners[id].forEach(function(r) {
                        r.write(data.input);
                        res += 1;
                    });
                    io.sockets.emit('beacon-response', {
                        id: id,
                        msg: '"' + data.input + '" sent to ' + res + ' processes.'
                    });
                }
            break;
            /********************************************************************** change directory */
            case 'cd':
                var dir = path.normalize(data.dir);
                fs.exists(dir, function(exists) {
                    if(exists) {
                        io.sockets.emit('beacon-response', {
                            id: id,
                            dir: dir
                        });
                    } else {
                        io.sockets.emit('beacon-response', {
                            id: id,
                            err: { msg: 'Wrong directory "' + dir + '".' }
                        });
                    }
                });
            break;
            /********************************************************************** git status */
            case 'git-status':
                var runner = TaskRunner();
                runner.run('git status -sb', data.cwd || defaultCWD)
                .err(function(data) {
                    io.sockets.emit('beacon-response', {
                        id: id,
                        err: data
                    });
                })
                .end(function(err, d, code) {
                    io.sockets.emit('beacon-response', {
                        id: id,
                        data: d
                    });
                });
            break;
            /********************************************************************** list */
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
                                        fs.stat(data.cwd + path.sep + item, function(err, stats) {
                                            if(err) { 
                                                error(err);
                                            } else {
                                                if(stats.isDirectory() || data.files) {
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
            case 'tray':
                io.sockets.emit('tray', data);
                if (Boolean(data.show)) {
                    argv.tray = true;
                    startElectron();
                }
            break;
            case 'theme':
                argv.dark = (data.theme == 'dark');
                io.sockets.emit('theme', data);
            break;
            case 'save':
                savedTasks = data.data;
                io.sockets.emit('updateTasks', {
                    tasks: savedTasks,
                    running: getCurrentRunnersIds()
                });
                fs.writeFile(path.resolve(__dirname+'/savedTasks.json'), savedTasks, 'utf8', function (err) {
                  if (err) throw err;
                });
            break;
        }
    });
});

reportingProcesses();

console.log('Yez! is running.');