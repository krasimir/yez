var spawnargs = require('spawn-args');
module.exports = function(c) {
	var command = '', args = [], parts = c.split(' ');
	command = parts.shift();
	args = spawnargs(parts.join(' '));
	return {
		command: command,
		args: args
	}
}