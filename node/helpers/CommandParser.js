module.exports = function(c) {
	var command = '', args = [], a = [];
	args = c ? c.split(' ') : [];
	command = args.shift();
	for(var i=0; i<args.length; i++) {
		if(args[i] != '') a.push(args[i]);
	}
	args = a;
	return {
		command: command,
		args: args
	}
}