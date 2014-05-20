var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Please type your name:', function(answer) {
	console.log('Hello ' + answer + '. It\'s nice to mee you.');
	rl.close();
	process.exit();
});