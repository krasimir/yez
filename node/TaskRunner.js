module.exports = function() {
	var api = {},
		cp = require('child_process'),
		parser = require('./helpers/CommandParser'),
		processing = null;

	api.run = function(c, path) {

		var c = parser(c),
			options = { cwd: path || process.cwd() },
			out = [], outcb = null,
			err = [], errcb = null,
			endcb = null,
			finished = false;

		try {
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
				err.push(e);
			});
			processing.on('close', function (code) {
				// console.log('child process exited with code ' + code);
				endcb && endcb(err.length > 0 ? err : false, out, code);
			});
		} catch(err) {
			endcb && endcb(err, out, code);
		}

		return {
			data: function(cb) { outcb = cb; return this; },
			err: function(cb) { errcb = cb; return this; },
			end: function(cb) { endcb = cb; return this; }
		}

	}
	api.stop = function(cb) {
		if(processing) {
			processing.kill();
			cb && cb(null, 'Process stopped.');
		} else {
			cb && cb('The command is not running.');
		}
	}
	return api;
}