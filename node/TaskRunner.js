var psTree = require('ps-tree'),
	os = require('os'),
	cp = require('child_process'),
	parser = require('./helpers/CommandParser'),
	isWin = /^win/.test(process.platform);

var kill = function (pid, signal, callback) {
	signal   = signal || 'SIGKILL';
	callback = callback || function () {};
	var killTree = true;
	if(killTree) {
		psTree(pid, function (err, children) {
			[pid].concat(
				children.map(function (p) {
					return p.PID;
				})
			).forEach(function (tpid) {
				try { process.kill(tpid, signal) }
				catch (ex) { }
			});
			callback();
		});
	} else {
		try { process.kill(pid, signal) }
		catch (ex) { }
		callback();
	}
};
module.exports = function() {
	var api = {}, processing = null;

	api.ended = false;
	api.run = function(c, path) {

		var c = parser(c),
			options = { 
				cwd: path || process.cwd(),
				env: process.env,
				max: 1,
				silent: true,
				// detached: true
			},
			out = [], outcb = null,
			err = [], errcb = null,
			endcb = null, exitcb = null,
			pathExtWin = ['.cmd', '.bat', '.exe'];
		try {
			(function go(c) {
				preventEnding = false; 
				//console.log(c.command, c.args, options);
				processing = cp.spawn(c.command, c.args, options);
				processing.stdout.setEncoding('utf8');
				processing.stderr.setEncoding('utf8');
				processing.stdout.on('data', function (data) {
					// console.log('stdout: ' + data);
					data = data.toString('utf8');
					out.push(data);
					outcb && outcb(data);
				});
				processing.on('message', function (data) {
					// console.log('message code: ' + data);					
					data = data.toString('utf8');
					out.push(data);
					outcb && outcb(data);				
				});
				processing.stderr.on('data', function (data) {
					// console.log('stderr: ' + data);
					data = data.toString('utf8');
					err.push(data);
					errcb && errcb(data);
				});
				processing.on('error', function (e) {
					// console.log('error: ', e);
					if(e && e.code && e.code == 'ENOENT' && pathExtWin.length > 0) {
						preventEnding = true;
					} else {
						err.push(e);
					}
				});
				processing.on('close', function (code) {
					// console.log('close code: ' + code);
					if(preventEnding) {
						c.command += pathExtWin.shift();
						go(c);
					} else {
						api.ended = true;
						endcb && endcb(err.length > 0 ? err : false, out, code);
					}
				});
				processing.on('disconnect', function (code) {
					// console.log('disconnect code: ' + code);					
					api.ended = true;
					endcb && endcb(err.length > 0 ? err : false, out, code);					
				});
				processing.on('exit', function (code, signal) {
					// console.log('exit code: ' + code + ' signal: ' + signal);
					api.ended = true;
					exitcb && exitcb(code, signal);
				});
			})(c);
		} catch(err) {
			// console.log('Error: ', err);
			api.ended = true;
			endcb && endcb(err, out, code);
		}

		return {
			data: function(cb) { outcb = cb; return this; },
			err: function(cb) { errcb = cb; return this; },
			end: function(cb) { endcb = cb; return this; },
			exit: function(cb) { exitcb = cb; return this; }
		}

	}
	api.stop = function() {
		if(processing) {
			if(!isWin) {
				kill(processing.pid);
			} else {
				cp.exec('taskkill /PID ' + processing.pid + ' /T /F', function (error, stdout, stderr) {
				    // console.log('stdout: ' + stdout);
				    // console.log('stderr: ' + stderr);
				    // if(error !== null) {
				    //   	console.log('exec error: ' + error);
				    // }
				});				
			}
		}
	}
	api.write = function(value) {
		if(processing) {
			processing.stdin.write(value + '\n');
		}
	}
	return api;
}