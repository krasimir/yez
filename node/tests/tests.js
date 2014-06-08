var expect = require('expect.js');
var TaskRunner = require('../TaskRunner');
var parser = require('../helpers/CommandParser');
var fs = require('fs');

describe("/ Command line parsing /", function() {
	it("should parse command without parameter", function(done) {
		var res = parser('node');
		expect(res.command).to.be.equal('node');
		expect(res.args.length).to.be.equal(0);
		done();
	});
	it("should parse command with one parameter", function(done) {
		var res = parser('node -v');
		expect(res.command).to.be.equal('node');
		expect(res.args.length).to.be.equal(1);
		expect(res.args[0]).to.be.equal('-v');
		done();
	});
	it("should parse command with many parameter", function(done) {
		var res = parser('node -v -a -f');
		expect(res.command).to.be.equal('node');
		expect(res.args.length).to.be.equal(3);
		expect(res.args[0]).to.be.equal('-v');
		expect(res.args[1]).to.be.equal('-a');
		expect(res.args[2]).to.be.equal('-f');
		done();
	});
	it("should clean up empty parameters", function(done) {
		var res = parser('node -v   -a -f');
		expect(res.command).to.be.equal('node');
		expect(res.args.length).to.be.equal(3);
		expect(res.args[0]).to.be.equal('-v');
		expect(res.args[1]).to.be.equal('-a');
		expect(res.args[2]).to.be.equal('-f');
		done();
	});
	it("should parse complex command", function(done) {
		var res = parser('git commit -am "Message here - with dash"');
		expect(res.command).to.be.equal('git');
		expect(res.args.length).to.be.equal(3);
		expect(res.args[0]).to.be.equal('commit');
		expect(res.args[1]).to.be.equal('-am');
		expect(res.args[2]).to.be.equal('Message here - with dash');
		done();
	});
});

describe("/ Running commands /", function(done) {
	it("should run a task", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node -v')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(code).to.equal(0);
			expect(err).to.equal(false);
			done();
		});
	});
	it("should run unknown command", function(done) {
		var runner = TaskRunner();
		runner.run('unknown command')
		.end(function(err, d, code) {
			expect(err).not.to.be(false);
			done();
		});
	});
	it("should run a continues task", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node ./node/tests/commands/continues.js')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(code).to.equal(0);
			expect(err).to.equal(false);
			expect(data[0]).to.equal('hello 9\n');
			expect(data.length).to.equal(10);
			done();
		});
	});
	it("should run a continues task by passing a path", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node continues.js', __dirname + '/commands')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(code).to.equal(0);
			expect(err).to.equal(false);
			expect(data[0]).to.equal('hello 9\n');
			expect(data.length).to.equal(10);
			done();
		});
	});
	it("should run a continues task which fail", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node ./node/tests/commands/continues-fail.js')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(data[0]).to.equal('hello 9\n');
			expect(data.length).to.equal(6);
			expect(err.join(',').indexOf('Ops!') > 0).to.equal(true);
			done();
		});
	});
	it("should run a commands with parameters", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node continues-with-params.js -v --reporter spec', __dirname + '/commands')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(code).to.equal(0);
			expect(err).to.equal(false);
			expect(data[0]).to.equal('-v,--reporter,spec\n');
			done();
		});
	});
	it("should run a commands and stop it", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node server.js', __dirname + '/commands')
		.data(function(d) { data.push(d); })
		.end(function(err, d, code) {
			expect(err).to.equal(false);
			expect(data[0]).to.equal('Server running at http://127.0.0.1:1339/\n');
			done();
		});
		setTimeout(function() {
			runner.stop(function(err, res) {
				expect(err).to.equal(null);
				expect(res).to.equal('Process stopped.');
			});	
		}, 100);		
	});
	it("should run a commands with stdin", function(done) {
		var runner = TaskRunner(), data = [];
		runner.run('node stdin-program.js', __dirname + '/commands')
		.data(function(d) { 
			data.push(d);
			if(d == 'Please type your name:') {
				runner.write('Yezzzy');
			}			
		})
		.end(function(err, d, code) {
			expect(err).to.equal(false);
			expect(data[0]).to.equal('Please type your name:');
			expect(data[1]).to.equal('Hello Yezzzy. It\'s nice to mee you.\n');
			done();
		});
	});
	it("should start and stop grunt", function(done) {
		this.timeout(5000);
		var runner = TaskRunner(), data = [];
		runner.run('grunt', __dirname + '/commands/grunt-test')
		.data(function(d) { 
			// console.log(data.length);
			data.push(d);			
		})
		.end(function(err, d, code) {
			// console.log('\n\nend', err, code);
		})
		.exit(function(code, signal) {
			// console.log('\n\nexit', code, signal);
		});
		setTimeout(function() {
			runner.stop();
			var totalResponses = data.length;
			var file = __dirname + '/commands/grunt-test/src/A.js';
			var fileContent = fs.readFileSync(file);
			fs.writeFileSync(file, fileContent + 'c');
			setTimeout(function() {
				expect(data.length).to.equal(totalResponses);
				done();
			}, 1000);
		}, 1000);
	});
})