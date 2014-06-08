var spawnargs = require('spawn-args');
module.exports = function(c) {
	var command = '', args = [], parts = c.split(' ');
	command = parts.shift();
	args = spawnargs(parts.join(' '));
	for(var i=0; i<args.length; i++) {
		var a = args[i];
		if(a.charAt(0) === '"') {
			a = a.substr(1, a.length);
		}
		if(a.charAt(a.length-1) === '"') {
			a = a.substr(0, a.length-1);
		}
		args[i] = a; 
	}
	return {
		command: command,
		args: args
	}
}