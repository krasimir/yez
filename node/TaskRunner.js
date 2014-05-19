module.exports = function() {
	var api = {},
		cp = require('child_process'),
		parser = require('./helpers/CommandParser'),
		processing = null;

	api.run = function(c, path) {

		var c = parser(c),
			options = { 
				cwd: path || process.cwd(),
				env: process.env,
				max: 1,
				silent: true
			},
			out = [], outcb = null,
			err = [], errcb = null,
			endcb = null, pathExtWin = ['.cmd', '.bat'];

		try {
			(function go(c) {
				preventEnding = false;
				processing = cp.spawn(c.command, c.args, options);
				processing.stdout.on('data', function (data) {
					// console.log('stdout: ' + data);
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
					if(e && e.code && e.code == 'ENOENT' && pathExtWin.length > 0) {
						preventEnding = true;
					} else {
						err.push(e);
					}
				});
				processing.on('close', function (code) {
					if(preventEnding) {
						c.command += pathExtWin.shift();
						go(c);
					} else {
						endcb && endcb(err.length > 0 ? err : false, out, code);
					}
				});
			})(c);
		} catch(err) {
			endcb && endcb(err, out, code);
		}

		return {
			data: function(cb) { outcb = cb; return this; },
			err: function(cb) { errcb = cb; return this; },
			end: function(cb) { endcb = cb; return this; },
			ended: false
		}

	}
	api.stop = function(cb) {
		if(processing) {
			processing.kill();
		} else {
			cb && cb('The command is not running.');
		}
	}
	return api;
}