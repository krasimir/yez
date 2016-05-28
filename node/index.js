#!/usr/bin/env node

var app = require('http').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    yezBackendPort = 9172,
    httpPort = 9173,
    TaskRunner = require('./TaskRunner'),
    path = require('path'),
    defaultCWD = path.normalize(process.cwd()),
    runners = {},
    lastActive = 0,
    electron = require('electron-prebuilt'),    
    proc = require('child_process'),
    argv = require('yargs').argv,
    httpServer = require('http-server');

app.listen(yezBackendPort);

httpServer.createServer({root: path.normalize(__dirname+'/../chrome')}).listen(httpPort);

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
            // console.log('Running processes: ' + active);
        }
    }
    setTimeout(reportingProcesses, 1600);
};

var runCommand = function (data, command, id) {
    var runner = TaskRunner();
    runner.id = id;
    runner.run(command, data.cwd || defaultCWD)
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
    return runner;
};

var savedTasks;

var readTasks = function (cb) {
    fs.readFile(path.resolve(__dirname+'/savedTasks.json'), 'utf8', function (err, data) {
        if (err) throw err;
        savedTasks = data;
        cb();
    });
};

readTasks(function () {
    var tasks = JSON.parse(savedTasks);
    for(var i=0;i<tasks.length;i++) {
         var task = tasks[i];
         runners[task.id] = [];                
         if(task.autorun) {
             for(var j=0;j<task.commands.length;j++) {
                   var runner = runCommand(task, task.commands[j], task.id);
                   //console.log('task', task.commands[j], task.id);
                   runners[task.id].push(runner);
             }
         } 
    }
});

var savedAliases;

var readAliases = function () {
    fs.readFile(path.resolve(__dirname+'/savedAliases.json'), 'utf8', function (err, data) {
        if (err) throw err;
        savedAliases = data;        
    });
};

readAliases();

var spawnElectron;

var startElectron = function () {
    if (!spawnElectron) {
        spawnElectron = proc.spawn(electron, [
            path.resolve(__dirname + '/../electron/tray.js'),
            JSON.stringify({
                pid: process.pid, 
                tray: argv.tray, 
                dark: argv.dark,
                port: httpPort
            })
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
      aliases: savedAliases,
      running: getCurrentRunnersIds(),
      sep: path.sep,
      dark: argv.dark,
      tray: argv.tray
    });
    socket.on('data', function (data) {
        if(!data || !data.id) return;
        var id = data.id;
        switch(data.action) {
            /********************************************************************** run command */
            case 'run-command':
                var runner = runCommand(data, data.command, id);
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
            /********************************************************************** tray */
            case 'tray':
                data.id = 'update';
                io.sockets.emit('tray', data);
                argv.tray = Boolean(data.show)
                if (argv.tray) startElectron();
            break;
            /********************************************************************** theme */
            case 'theme':
                data.id = 'update';
                io.sockets.emit('theme', data);                
                argv.dark = (data.theme == 'dark');
            break;
            /********************************************************************** save */
            case 'saveTasks':
                savedTasks = data.tasks;
                socket.broadcast.emit('updateTasks', {
                 tasks: savedTasks,
                 running: getCurrentRunnersIds()
                });
                fs.writeFile(path.resolve(__dirname+'/savedTasks.json'), savedTasks, 'utf8', function (err) {
                  if (err) throw err;
                });
            break;
            /********************************************************************** aliases */
            case 'aliases':
                savedAliases = data.aliases;
                socket.broadcast.emit('updateAliases', {
                    aliases: savedAliases
                });
                fs.writeFile(path.resolve(__dirname+'/savedAliases.json'), savedAliases, 'utf8', function (err) {
                  if (err) throw err;
                });
            break;
        }
    });
});

reportingProcesses();

console.log('Yez! back-end is running. Install the Chrome extension or open http://localhost:' + httpPort);