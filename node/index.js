#!/usr/bin/env node

var electron = require('electron'),
    electronApp = electron.app,    
    app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),    
    fs = require('fs'),
    port = 9172,
    TaskRunner = require('./TaskRunner'),
    path = require('path'),
    defaultCWD = path.normalize(process.cwd()),
    runners = {}, 
    lastActive = 0,
    appIcon = null,
    open = require('open');

electronApp.on('ready', function(){

    app.listen(port);

    //var trayTask = TaskRunner();
    //trayTask.run('electron .', path.normalize(__dirname + '/yez-icon') );

    var getCurrentRunnersIds = function() {
        cleaningRunners();
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
    }
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
    }

    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.emit('initial', { cwd: defaultCWD, running: getCurrentRunnersIds() });
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
                                            fs.stat(data.cwd + '/' + item, function(err, stats) {
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
            }
        });
    });

    reportingProcesses();

    appIcon = new electron.Tray( path.normalize( __dirname + '/../chrome/img/icon16w.png') );
    appIcon.setToolTip('Yez! is running');
    appIcon.setContextMenu(electron.Menu.buildFromTemplate([{
        label: 'Light Style', 
        type: 'radio', 
        checked: true, 
        click: function () { appIcon.setImage( path.normalize( __dirname + '/../chrome/img/icon16w.png') ) } 
      }, { 
        label: 'Dark Style', 
        type: 'radio', 
        click: function () { appIcon.setImage( path.normalize( __dirname + '/../chrome/img/icon16.png') ) } 
      }, { 
        type: 'separator'
      }, {
        label: 'Developer tools', 
        click: function () { TaskRunner().run('devtool'); } 
      }, { 
        type: 'separator'
      }, { 
        label: 'View in Store', 
        click: function () { open('https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap'); } 
      }, { 
        label: 'About Yez!', 
        click: function () { open('https://github.com/krasimir/yez'); } 
      }, { 
        type: 'separator'
      }, { 
        label: 'Close', click: function () {  electronApp.quit(); } 
    }]));

});

console.log('Yez! is running.');